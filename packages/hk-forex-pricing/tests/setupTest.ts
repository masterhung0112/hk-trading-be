import dotenv from 'dotenv'
import type {Config} from '@jest/types'

dotenv.config({path: './env/.env.local'})

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
}
export default config
