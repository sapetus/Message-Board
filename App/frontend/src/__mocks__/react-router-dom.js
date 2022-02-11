//https://medium.com/@antonybudianto/react-router-testing-with-jest-and-enzyme-17294fefd303
//tests don't work without this
import React from 'react';

const reactRouterDom = require("react-router-dom")
reactRouterDom.BrowserRouter = ({ children }) => <div>{children}</div>

module.exports = reactRouterDom