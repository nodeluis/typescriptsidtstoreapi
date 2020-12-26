"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const morgan_1 = tslib_1.__importDefault(require("morgan"));
const path_1 = tslib_1.__importDefault(require("path"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const express_1 = tslib_1.__importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
require("express-async-errors");
const MainSevice_1 = tslib_1.__importDefault(require("./services/MainSevice"));
const adminservices_1 = tslib_1.__importDefault(require("./services/adminservices"));
const CustomerService_1 = tslib_1.__importDefault(require("./services/CustomerService"));
const CategoryService_1 = tslib_1.__importDefault(require("./services/CategoryService"));
const StoreServices_1 = tslib_1.__importDefault(require("./services/StoreServices"));
const SearchService_1 = tslib_1.__importDefault(require("./services/SearchService"));
const NotificationService_1 = tslib_1.__importDefault(require("./services/NotificationService"));
const ShoppingCartService_1 = tslib_1.__importDefault(require("./services/ShoppingCartService"));
const AccountVerifyService_1 = tslib_1.__importDefault(require("./services/AccountVerifyService"));
const Logger_1 = tslib_1.__importDefault(require("./shared/Logger"));
//const express_fileupload_1 = tslib_1.__importDefault(require("express-fileupload"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const app = express_1.default();
app.use(cors_1.default({origin:'*'}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(cookie_parser_1.default());
/*app.use(express_fileupload_1.default({
    limits: { fileSize: 50 * 1024 * 1024 },
}));*/
if (process.env.NODE_ENV === 'development') {
    app.use(morgan_1.default('dev'));
}
if (process.env.NODE_ENV === 'production') {
    app.use(helmet_1.default());
}
app.use('/', MainSevice_1.default);
app.use('/admin', adminservices_1.default);
app.use('/api/v1/customer', CustomerService_1.default);
app.use('/api/v1/category', CategoryService_1.default);
app.use('/api/v1/store', StoreServices_1.default);
app.use('/api/v1/search', SearchService_1.default);
app.use('/api/v1/notify', NotificationService_1.default);
app.use('/api/v1/cart', ShoppingCartService_1.default);
app.use('/api/v1/account', AccountVerifyService_1.default);
app.use((err, req, res, next) => {
    Logger_1.default.error(err.message, err);
    return res.status(http_status_codes_1.BAD_REQUEST).json({
        error: err.message,
    });
});
const viewsDir = path_1.default.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path_1.default.join(__dirname, 'public');
app.use(express_1.default.static(staticDir));
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: viewsDir });
});

const http_1 = tslib_1.__importDefault(require("http"));
const socket_io_1 = tslib_1.__importDefault(require("socket.io"));
const server = http_1.default.createServer(app);
const io = socket_io_1.default.listen(server);
const ChatService_1 = tslib_1.__importDefault(require("./services/ChatService"));
ChatService_1.default(io);

server.listen(8000,()=>{
  console.log('listen 8000');
  
});

exports.default = app;