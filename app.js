"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

const MainSevice_1 = tslib_1.__importDefault(require("./services/MainSevice"));
const adminservices_1 = tslib_1.__importDefault(require("./services/adminservices"));
const CustomerService_1 = tslib_1.__importDefault(require("./services/CustomerService"));
const CategoryService_1 = tslib_1.__importDefault(require("./services/CategoryService"));
const StoreServices_1 = tslib_1.__importDefault(require("./services/StoreServices"));
const SearchService_1 = tslib_1.__importDefault(require("./services/SearchService"));
const NotificationService_1 = tslib_1.__importDefault(require("./services/NotificationService"));
const ShoppingCartService_1 = tslib_1.__importDefault(require("./services/ShoppingCartService"));
const AccountVerifyService_1 = tslib_1.__importDefault(require("./services/AccountVerifyService"));
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({origin: 'https://mercadoxpress.herokuapp.com'}));

app.use('/', MainSevice_1.default);
app.use('/admin', adminservices_1.default);
app.use('/api/v1/customer', CustomerService_1.default);
app.use('/api/v1/category', CategoryService_1.default);
app.use('/api/v1/store', StoreServices_1.default);
app.use('/api/v1/search', SearchService_1.default);
app.use('/api/v1/notify', NotificationService_1.default);
app.use('/api/v1/cart', ShoppingCartService_1.default);
app.use('/api/v1/account', AccountVerifyService_1.default);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(8000,()=>{
  console.log('escuchando en le puerto 8000');
  
});

module.exports = app;
