/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AuthController from '../app/Controllers/Http/AuthController.js'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Auth routes
router.post('/auth/register', [AuthController, 'register'])
router.post('/auth/login', [AuthController, 'login'])
router.post('/auth/logout', [AuthController, 'logout'])
router.post('/auth/verify', [AuthController, 'verifyEmail'])
router.post('/auth/password/request', [AuthController, 'requestPasswordReset'])
router.post('/auth/password/reset', [AuthController, 'resetPassword'])
