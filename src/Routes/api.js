const express = require('express');
const router = express.Router();
const UserController = require('../Controller/UserController')
const ProductController = require('../Controller/ProductController')
const locationController = require('../Controller/locationController')
const FavouriteController = require('../Controller/FavouriteController')
const AdminController = require('../Controller/AdminController')
const ReportController = require('../Controller/ReportController')
const CommentController = require('../Controller/CommentController')
const AuthVerifyMiddleware = require('../middleware/AuthVerification')
const AdminAuthVerification = require('../middleware/AdminAuthVerification')

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });
  //Admin manage
  router.post('/adminCreateProduct', AdminAuthVerification,  upload.array('images', 6), AdminController.createProduct);

  router.get("/admingetAllProduct", AdminController.getAllProduct) 
  router.post("/adminLogin", AdminController.login) 
  
  router.post('/createCategory', AdminAuthVerification,upload.single('image'), AdminController.createCategory)
  router.post('/removeCategory', AdminAuthVerification, AdminController.removeCategory)
  router.post('/createSubCategory', AdminAuthVerification, AdminController.createSubCategory)
  router.post('/createBrand', AdminAuthVerification, AdminController.createBrand)
  router.post('/adminDeleteProduct', AdminAuthVerification, AdminController.deleteProduct)
  router.get('/all-user', AdminAuthVerification, AdminController.getallUser)
  router.post('/removeUser/:userId', AdminAuthVerification, AdminController.removeUser)
  router.get('/getAllReport', AdminAuthVerification, AdminController.getAllReport)
  router.get('/getReportById/:productId', AdminAuthVerification, AdminController.getReportById)

  //loaction set
  router.post('/AddLocation', AdminAuthVerification, AdminController.AddLocation)
  router.post('/removeLocation/:locId', AdminAuthVerification, AdminController.removeLocation)

  router.get("/getdivision", locationController.getdivision)
  router.get("/getdistricts/:division", locationController.getdistricts)
  


  router.get("/getProductByDivision/:division", locationController.ProductByDivision)
  router.get("/getProductByDistrict/:district", locationController.ProductByDistrict)


    
//-----User Manage
router.post("/registration", UserController.userRegistration) 
router.post("/verifyEmail/:email/:otp", UserController.EmailVerify) 
router.post("/login", UserController.userLogin) 
router.post("/updateProfile", AuthVerifyMiddleware, UserController.updateProfile) 
router.get("/getProfile", AuthVerifyMiddleware, UserController.getProfile) 
router.post("/deleteAccount", AuthVerifyMiddleware, UserController.deleteAccount) 
router.post("/updateImage", AuthVerifyMiddleware, upload.single('image'), UserController.updateImage) 
router.get("/logout", AuthVerifyMiddleware, UserController.logout) 

// User Product Manages
router.post('/createUserProduct', AuthVerifyMiddleware, upload.array('images', 6), ProductController.createProduct)
router.post('/reportProduct/:productId', AuthVerifyMiddleware, ReportController.ReportProduct)
//comment product
router.post('/commentProduct/:productId', AuthVerifyMiddleware, CommentController.CommentProduct)
router.get('/getCommentByProduct/:productId', CommentController.getCommentByProduct)

router.get('/usersProduct', AuthVerifyMiddleware, ProductController.usersProduct)
router.get('/product-details/:productId',  ProductController.productDetailsById)
router.post('/deleteUserproduct', AuthVerifyMiddleware, ProductController.deleteUserproduct)

router.get('/getallProducts',  ProductController.getAllProduct)


//Favourite product
router.post('/AddFavourite/:productId', AuthVerifyMiddleware, FavouriteController.AddFavourite)
router.get('/getFavoriteProduct', AuthVerifyMiddleware, FavouriteController.getFavoriteProduct)
router.delete('/RemoveFavourite', AuthVerifyMiddleware, FavouriteController.RemoveFavourite)
//Product Listing
router.get('/getAllCategory',  ProductController.getAllCategory)
router.get('/getSubCategory/:CategoryId',  ProductController.getSubCategory)
router.get('/getAllBrand',  ProductController.getAllBrand)
router.get('/ProductListByCategory/:CategoryId',  ProductController.ProductListByCategory)
router.get('/searchProductbyKeyword/:keyword', AuthVerifyMiddleware, ProductController.searchProductbyKeyword)
router.get('/ProductListByFilter',  ProductController.ProductListByFilter)
router.get('/LocationCategorySearch/:division/:district/:category',  ProductController.LocationCategorySearch)


// untest api

module.exports = router

