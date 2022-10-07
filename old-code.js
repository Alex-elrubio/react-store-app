import React, { useState } from "react";
import "./App.css";

import thunk from "redux-thunk";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider, connect } from "react-redux";
function createStore(reducer){
    let state       = reducer(undefined, {}) //стартовая инициализация состояния, запуск редьюсера со state === undefined
    let cbs         = []                     //массив подписчиков

    const getState  = () => state            //функция, возвращающая переменную из замыкания
    const subscribe = cb => (cbs.push(cb),   //запоминаем подписчиков в массиве
        () => cbs = cbs.filter(c => c !== cb)) //возвращаем функцию unsubscribe, которая удаляет подписчика из списка

    const dispatch  = action => {
        if (typeof action === 'function'){ //если action - не объект, а функция
            return action(dispatch, getState) //запускаем эту функцию и даем ей dispatch и getState для работы
        }
        const newState = reducer(state, action) //пробуем запустить редьюсер
        if (newState !== state){ //проверяем, смог ли редьюсер обработать action
            state = newState //если смог, то обновляем state
            for (let cb of cbs)  cb() //и запускаем подписчиков
        }
    }

    return {
        getState, //добавление функции getState в результирующий объект
        dispatch,
        subscribe //добавление subscribe в объект
    }
}

function combineReducers(reducers) {
    return (state={}, action) => {
        const newState = {}
        // перебрать все редьюсеры
        if (reducers) {
            for (const [reducerName, reducer] of Object.entries(reducers)) {
                const newSubState = reducer(state[reducerName], action)
                if (newSubState !== state[reducerName]) {
                    newState[reducerName] = newSubState
                }
            }
            // если newState не пустой, то вернуть стейт в
            if (Object.keys(newState).length !== 0) {
                return {...state, ...newState}
            } else {
                return state
            }
        }

    }
}

const combinedReducer = combineReducers({promise: promiseReducer, auth: authReducer, cart: cartReducer})
const store = createStore(combinedReducer)

store.subscribe(() => console.log(store.getState()))



function jwtDecode(token){
    try {
        return JSON.parse(atob(token.split('.')[1]))
    }
    catch(e){
    }
}

function authReducer(state, {type, token}) {
    if (!state) {
        if (localStorage.authToken) {
            token = localStorage.authToken
            type = 'AUTH_LOGIN'
        } else {
            return {}
        }
    }
    if (type === 'AUTH_LOGIN') {
        let payload = jwtDecode(token)
        if (typeof payload === 'object') {
            localStorage.authToken = token
            return {
                ...state,
                token,
                payload
            }
        } else {
            return state
        }
    }
    if (type === 'AUTH_LOGOUT') {
        delete localStorage.authToken
        location.reload()
        return {}
    }
    return state
}

const actionAuthLogin = (token) => ({type: 'AUTH_LOGIN', token})
const actionAuthLogout = () => ({type: 'AUTH_LOGOUT'})



function cartReducer (state={}, {type, good={}, count=1}) {

    if (Object.keys(state).length === 0 && localStorage.cart) {
        let currCart = JSON.parse(localStorage.cart)
        if (currCart && Object.keys(currCart).length !== 0) {
            state = currCart
        }
    }

    const {_id} = good

    const types = {
        CART_ADD() {
            count = +count
            if (!count) {
                return state
            }
            let newState = {
                ...state,
                [_id]: {good, count: (count + (state[_id]?.count || 0)) < 1 ? 1 : count + (state[_id]?.count || 0)}
            }
            localStorage.cart = JSON.stringify(newState)
            return newState
        },
        CART_CHANGE() {
            count = +count
            if (!count) {
                return state
            }
            let newState = {
                ...state,
                [_id]: {good, count: count < 0 ? 0 : count}
            }
            localStorage.cart = JSON.stringify(newState)
            return newState
        },
        CART_REMOVE() {
            let { [_id]: removed, ...newState }  = state
            localStorage.cart = JSON.stringify(newState)
            return newState
        },
        CART_CLEAR() {
            localStorage.cart = JSON.stringify({})
            return {}
        },
    }
    if (type in types) {
        return types[type]()
    }
    return state
}

const actionCartAdd = (good, count) => ({type: 'CART_ADD', good, count})
const actionCartChange = (good, count) => ({type: 'CART_CHANGE', good, count})
const actionCartRemove = (good) => ({type: 'CART_REMOVE', good})
const actionCartClear = () => ({type: 'CART_CLEAR'})


function promiseReducer(state={}, {type, status, payload, error, name}) {
    if (!state) {
        return {}
    }
    if (type === 'PROMISE') {
        return {
            ...state,
            [name]: {
                status: status,
                payload : payload,
                error: error,
            }
        }
    }
    return state
}

const actionPending = (name) => ({type: 'PROMISE', status: 'PENDING', name})
const actionResolved = (name, payload) => ({type: 'PROMISE', status: 'RESOLVED', name, payload})
const actionRejected = (name, error) => ({type: 'PROMISE', status: 'REJECTED', name, error})


const actionPromise = (name, promise) => (
    async (dispatch) => {
        dispatch(actionPending(name))
        try {
            let data = await promise
            dispatch(actionResolved(name, data))
            return data
        }
        catch(error){
            dispatch(actionRejected(name, error))
        }
    }
)

const getGQL = url => (
    async (query, variables={}) => {
        let obj = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                ...(localStorage.authToken ? {Authorization: "Bearer " + localStorage.authToken} : {})
            },
            body: JSON.stringify({ query, variables })
        })
        let a = await obj.json()
        if (!a.data && a.errors) {
            throw new Error(JSON.stringify(a.errors))
        } else {
            return a.data[Object.keys(a.data)[0]]
        }
    }
)

const backURL = 'http://shop-roles.node.ed.asmer.org.ua/'
const gql = getGQL(backURL + 'graphql');



const actionOrder = () => (
    async (dispatch, getState) => {
        let {cart} = getState()

        const orderGoods = Object.entries(cart)
            .map(([_id, {good, count}]) => ({good: {_id}, count}))

        let result = await dispatch(actionPromise('order', gql(`
                  mutation newOrder($order:OrderInput){
                    OrderUpsert(order:$order)
                      { _id total}
                  }
          `, {order: {orderGoods}})))
        if (result?._id) {
            dispatch(actionCartClear())
        }
    })





const actionLogin = (login, password) => (
    actionPromise('login', gql(`query log($login: String, $password: String) {
        login(login: $login, password: $password)
    }`, {login, password}))
)

const actionFullLogin = (login, password) => (
    async (dispatch) => {
        let token = await dispatch(actionLogin(login, password))
        if (token) {
            dispatch(actionAuthLogin(token))
            location.hash = '#/category'
        } else {
            showErrorMessage('please, enter correct login and password', main)
        }
    }
)


const actionRegister = (login, password) => (
    actionPromise('register', gql(`mutation reg($user:UserInput) {
        UserUpsert(user:$user) {
        _id 
        }
    }
    `, {user: {login, password}})
    )
)

const actionFullRegister = (login, password) => (
    async (dispatch) => {
        let registerId = await dispatch(actionRegister(login, password))

        if (registerId) {
            dispatch(actionFullLogin(login, password))
        }
    }
)



const actionRootCats = () => (
    actionPromise('rootCats', gql(`query {
        CategoryFind(query: "[{\\"parent\\":null}]"){
            _id name
        }
    }`))
)

const actionCatById = (_id) => (
    actionPromise('catById', gql(`query catById($q: String){
        CategoryFindOne(query: $q){
            _id name goods {
                _id name price images {
                    url
                }
            }
            subCategories {
                _id name 
            }
        }
    }`, {q: JSON.stringify([{_id}])}))
)

const actionGoodById = (_id) => (
    actionPromise('goodById', gql(`query goodById($q: String) {
        GoodFindOne(query: $q) {
            _id name price description images {
            url
            }
        }
    }`, {q: JSON.stringify([{_id}])}))
)

const actionGoodsByUser = (_id) => (
    actionPromise('goodByUser', gql(`query oUser($query: String) {
        OrderFind(query:$query){
        _id orderGoods{
                price count total good{
                    _id name categories{
                    name
                    }
                    images {
                        url
                    }
                }
            } 
            owner {
            _id login
            }
        }
    }`,
        {query: JSON.stringify([{___owner: _id}])}))
)

store.subscribe(() => {
    const {promise, auth} = store.getState()
    const {rootCats} = promise

    if (rootCats?.status === 'PENDING') {
        aside.innerHTML = `<img src="Loading_icon.gif">`
    } else {
        if (rootCats?.payload) {
            aside.innerHTML = ''
            authBox.innerHTML = ''
            const regBtn = document.createElement('a')
            regBtn.href = '#/register'
            regBtn.innerText = 'Register'
            const loginBtn = document.createElement('a')
            loginBtn.className = 'loginBtn'
            loginBtn.href = `#/login`
            loginBtn.innerText = 'Login'
            const logoutBtn = document.createElement('a')
            logoutBtn.innerText = 'Logout'
            auth.token ? authBox.append(logoutBtn) : authBox.append(regBtn, loginBtn)

            logoutBtn.onclick = () => {
                store.dispatch(actionAuthLogout())
            }
            for (const {_id, name} of rootCats?.payload) {
                const link = document.createElement('a')
                link.href = `#/category/${_id}`
                link.innerText = name
                aside.append(link)
            }
        }
    }
})

store.dispatch(actionRootCats())


function createForm(parent, type, callback) {
let {auth} = store.getState()
    let res = `<label for="login${type}">Nick</label>
            <input id="login${type}" type="text"/>
            <label for="pass${type}">Password</label>
            <input id="pass${type}" type="password"/>
      
        <button id="btn${type}">${type}</button>
    </div>`
    parent.innerHTML = res
    return () => window[`btn${type}`].onclick = () => {
        store.dispatch(callback(window[`login${type}`].value, window[`pass${type}`].value))
    }
}

let message = document.createElement('p')
function showErrorMessage(text, parent) {
    message.innerHTML = text
    parent.append(message)
    }



const createCartPage = (parent) => {
    parent.innerHTML = ''
    const {cart} = store.getState()

    const clearBtn = document.createElement('button')
    clearBtn.innerText = "clear all"
    if(Object.keys(cart).length !== 0) {
        parent.append(clearBtn)
    }
    clearBtn.onclick = () => {
        store.dispatch(actionCartClear())
    }

    const cartPage  = document.createElement('div')
    if(Object.keys(cart).length === 0) {
        showErrorMessage('Hmm... Let`s add something into the cart!', cartPage)
    }
    main.append(cartPage)

    let cartCounter = 0
    for(const item in cart) {
        const {good} = cart[item]
        const {count, good: {_id: id, name: name, price: price, images: [{url}]}} = cart[item]

        cartCounter += count*price

        const card = document.createElement('div')
        card.innerHTML = `
                        <h4>${name}</h4>
                        </div>
                        <img src="${backURL}/${url}" />
                        <p>amount: </p>                                
                        `

        const inputGr = document.createElement('div')
        card.lastElementChild.append(inputGr)

        const minusBtn = document.createElement('button')
        minusBtn.innerText = '-'
        inputGr.append(minusBtn)
        minusBtn.onclick = () => {
            store.dispatch(actionCartAdd(good, -1))
        }

        const changeCount = document.createElement('input')
        changeCount.type = 'number'
        changeCount.value = count
        changeCount.setAttribute('min', '1')
        inputGr.append(changeCount)
        changeCount.oninput = () => {
            store.dispatch(actionCartChange(good, changeCount.value))
        }

        const plusBtn = document.createElement('button')
        plusBtn.innerText = '+'
        inputGr.append(plusBtn)
        plusBtn.onclick = () => {
            store.dispatch(actionCartAdd(good))
        }

        const deleteGood = document.createElement('button')
        deleteGood.innerText = 'remove item'
        deleteGood.style.display = 'block'
        card.lastElementChild.append(deleteGood)
        deleteGood.onclick = () => {
            store.dispatch(actionCartRemove(good))
        }

        cartPage.append(card)
    }

    const total  = document.createElement('h5')
    total.innerText = `Total: ${cartCounter} UAH`

    const sendOrder = document.createElement('button')
    sendOrder.innerText = 'Make an order'
    if(Object.keys(cart).length !== 0) {
        parent.append(total)
        parent.append(sendOrder)
    }
    const {auth} = store.getState()
    sendOrder.disabled = !auth.token;
    sendOrder.onclick = () => {
        store.dispatch(actionOrder())
    }
}



// location.hash
window.onhashchange = () => {
    const [,route, _id] = location.hash.split('/')

    const routes = {
        category(){
            store.dispatch(actionCatById(_id))
        },
        good(){
            store.dispatch(actionGoodById(_id))
        },
        register(){
            const registerFunc = createForm(main, 'Register', actionFullRegister)
            registerFunc()
        },
        login(){
            const loginFunc = createForm(main, 'Login', actionFullLogin)
            loginFunc()
        },
        orders(){
            store.dispatch(actionGoodsByUser(_id))
        },
        cart(){
            createCartPage(main)
        }
    }
    if (route in routes) {
        routes[route]()
    }
}


store.subscribe(() => {
    const [,route] = location.hash.split('/')
    if (route === 'cart') {
        createCartPage(main)
    }
})


window.onhashchange()

store.subscribe(() => {
    const {promise} = store.getState()
    const {catById} = promise
    const [,route, _id] = location.hash.split('/')

    if (catById?.status === 'PENDING') {
        main.innerHTML = `<img src="Loading_icon.gif">`
    } else {
        if (catById?.payload && route === 'category'){
            main.innerHTML = ''
            const catBody  = document.createElement('div')
            main.append(catBody)

            const {name} = catById.payload;
            catBody.innerHTML = `<h1>${name}</h1>`

            if (catById.payload.subCategories) {
                const linkList  = document.createElement('div')
                catBody.append(linkList)

                for(const {_id, name} of catById.payload.subCategories) {
                    const link = document.createElement('a')
                    link.href = `#/category/${_id}`
                    link.innerText  = name
                    link.className = 'cat'
                    catBody.append(link)
                }
            if(location.hash === '#/category/') {
                for(const {_id, name} of catById.payload) {
                    const link = document.createElement('a')
                    link.href = `#/category/${_id}`
                    link.innerText  = name
                    link.className = 'cat'
                    catBody.append(link)
                }
            }
            }

            if (catById.payload.goods) {
                const cardBody  = document.createElement('div')
                main.append(cardBody)
                for (const good of catById.payload.goods){
                    const {_id, name, price, images} = good
                    const card      = document.createElement('div')
                    card.className = 'card'
                    card.innerHTML = `
                                    <img src="${backURL}/${images[0].url}" />
                                    <div>
                                        <h4>${name}</h4>
                                        <h5>${price} UAH</h5>                                    
                                        <a href="#/good/${_id}" class="showMore">
                                            Show more
                                        </a>
                                    </div>
                                    `
                    const btnCart = document.createElement('button')
                    btnCart.innerText = 'To cart'
                    btnCart.onclick = () => {
                        store.dispatch(actionCartAdd(good))
                    }
                    card.lastElementChild.append(btnCart)
                    cardBody.append(card)
                }
            }
        }
    }
})

store.subscribe(() => {
        const {promise} = store.getState()
        const {goodById} = promise
        const [,route, _id] = location.hash.split('/');

        if (goodById?.status === 'PENDING') {
            main.innerHTML = `<img src="Loading_icon.gif">`
        } else {
            if (goodById?.payload && route === 'good') {
                main.innerHTML = ''
                const good = goodById.payload
                const {_id, name, images, price, description} = good
                const card = document.createElement('div')
                card.innerHTML = `<h2>${name}</h2>
                                <img src="${backURL}/${images[0].url}" />
                                <div>                                    
                                    <h6>${description}</h6>
                                    <strong>Цена - ${price} грн</strong>
                                </div>
                                `
                const btnCart = document.createElement('button')
                btnCart.innerText  = 'Add to cart'
                btnCart.onclick = () => {
                    store.dispatch(actionCartAdd(good))
                }
                card.append(btnCart)
                main.append(card);
            }
        }
    }
)


store.subscribe(() => {
    const {auth} = store.getState()
    const name = document.createElement('div')
    name.innerText = `Hello, stranger`
    const {payload} = auth
    if (payload?.sub) {
        userBox.innerHTML = ''
        const {id, login}  = payload.sub
        name.innerText = `Hello, ${login}`
        const myOrders = document.createElement('a')
        myOrders.innerText = 'My orders'
        myOrders.href = `#/orders/${id}`
        userBox.append(myOrders)
    } else {
        userBox.innerHTML = ''
    }
    userBox.append(name)
})



store.subscribe(() => {
    const {promise} = store.getState()
    const {goodByUser} = promise
    const [,route] = location.hash.split('/')

    if (goodByUser?.status === 'PENDING') {
        main.innerHTML = `<img src="Loading_icon.gif">`
    } else {
        if (goodByUser?.payload && route === 'orders'){

            main.innerHTML = ''
            const cardBody  = document.createElement('div')
            main.append(cardBody)

            if (goodByUser.payload) {
                let totalMoney = 0

                for (const order of goodByUser.payload) {

                    if (order.orderGoods) {
                        for (const {price, count, total, good} of order.orderGoods) {
                            if (price !== null && count !== null && total !== null && good !== null) {
                                totalMoney += total
                                const {_id, name, images} = good

                                const card      = document.createElement('div')
                                card.innerHTML = `
                                <img src="${backURL}/${images[0].url}" />
                                <div>
                                    <h4>${name}</h4>
                                    // <h6>
                                    //     bought: ${count},  ${price} UAH 
                                    // </h6>  
                                    <h6>
                                        Total: ${total} UAH
                                    </h6>   
                                    <a href="#/good/${_id}">
                                        show more
                                    </a>
                                </div>
                                `
                                cardBody.append(card)

                            }
                        }
                    }

                }
                const totalBlock = document.createElement('h3')
                totalBlock.innerText = 'Total: ' + totalMoney + ' UAH'
                main.append(totalBlock)
            }
        }
    }
})



store.subscribe(() => {
    const {cart} = store.getState()
    let counter = 0;

    for (const key in cart) {
        counter += cart[key].count
    }
    cartCounter.innerText  = counter
})
