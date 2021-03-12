import { spawn, exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import uidSafe from 'uid-safe'

export class ExternalSort {
  private readonly _workDir: string
  private readonly _workFile: string
  private readonly _outFile: string

  constructor (workDir?: string) {
    this._workDir = path.join(workDir || '.', 'sort-' + uidSafe.sync(6))
    fs.mkdirSync(this._workDir, { recursive: true })
    this._workFile = path.join(this._workDir, 'infile')
    this._outFile = path.join(this._workDir, 'outfile')
  }

  createWriteStream () {
    return fs.createWriteStream(this._workFile)
  }

  async sort (): Promise<void> {
    console.error(`Sorting ${this._workFile} to ${this._outFile}`)
    return new Promise<void>((resolve, reject) => {
      const child = spawn('sort', ['-T', this._workDir, '-o', this._outFile, this._workFile], {
        stdio: ['ignore', process.stderr, process.stderr]
      })

      child.on('error', (error) => {
        console.error(`error: ${error.message}`)
        child.kill()
        reject(error)
      })

      child.on('close', (code) => {
        console.info(`sort process exited with code ${code}`)
        resolve()
      })
    })
  }

  createReadStream () {
    return fs.createReadStream(this._outFile)
  }

  async flush (): Promise<void>  {
    console.error(`Removing temporary work dir: ${this._workDir}`)
    return new Promise<void>((resolve, reject) => {
      exec(`rm -rvf ${this._workDir}`, (error, stdout, stderr) => {
        if (error) {
          reject(Error(`exec error: ${error}`))
          return
        }
        console.info(`stdout: ${stdout}`)
        console.info(`stderr: ${stderr}`)
        resolve()
      })
    })
      .catch((err) => {
        console.error('Directory removal failed')
        console.error(err)
      })
  }
}
