import { Router } from 'express'
import * as controller from '../controllers/aiController'

const router = Router()

router.post('/enrich', controller.enrich)

export default router
