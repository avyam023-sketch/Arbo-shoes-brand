import { spawn } from 'child_process'
import { writeFileSync } from 'fs'

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function captureViewport(name, width, height, isMobileDevice = false) {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      `--window-size=${width},${height}`,
      '--disable-gpu',
      'http://localhost:5173/',
    ],
    { stdio: 'ignore' }
  )

  await sleep(2500)

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json')
    const tabs = await listRes.json()
    const pageTab = tabs.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
    if (!pageTab) throw new Error('No debugger target found')

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl)
    await new Promise((resolve) => (ws.onopen = resolve))

    let id = 1
    const pending = new Map()

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data)
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data)
        pending.delete(data.id)
      }
    }

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++
        pending.set(msgId, resolve)
        ws.send(JSON.stringify({ id: msgId, method, params }))
      })
    }

    await send('Page.enable')
    await send('Runtime.enable')

    if (isMobileDevice) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 2,
        mobile: true,
      })
    }

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
      return res.result?.result?.value
    }

    async function screenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' })
      const buffer = Buffer.from(res.result.data, 'base64')
      writeFileSync(filename, buffer)
      console.log(`Saved screenshot: ${filename}`)
    }

    await sleep(3500)

    // Capture base view
    await screenshot(`C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\f512a6fb-d5b5-4ad6-8eaf-1101194e1d3d\\${name}_navbar.png`)

    if (isMobileDevice) {
      // Test mobile toggle open
      console.log('Testing mobile menu toggle...')
      await evaluate(`document.querySelector('.navbar__toggle')?.click()`)
      await sleep(600)
      await screenshot(`C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\f512a6fb-d5b5-4ad6-8eaf-1101194e1d3d\\${name}_menu_open.png`)

      // Close menu
      await evaluate(`document.querySelector('.navbar__toggle')?.click()`)
      await sleep(400)

      // Test mobile checkout modal
      console.log('Opening mobile cart & checkout...')
      await evaluate(`
        const btn = document.querySelector('.chrome__bag');
        if (btn) btn.click();
      `)
      await sleep(1000)
      await evaluate(`
        const chk = document.querySelector('.bag__checkout-btn');
        if (chk) chk.click();
      `)
      await sleep(1200)
      await screenshot(`C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\f512a6fb-d5b5-4ad6-8eaf-1101194e1d3d\\${name}_checkout.png`)
    }

    ws.close()
  } catch (err) {
    console.error(`Error capturing ${name}:`, err)
  } finally {
    chrome.kill()
  }
}

async function runAll() {
  console.log('--- 1. Desktop Viewport (1440x900) ---')
  await captureViewport('desktop', 1440, 900, false)
  await sleep(1500)

  console.log('--- 2. Tablet Viewport (768x1024) ---')
  await captureViewport('tablet', 768, 1024, false)
  await sleep(1500)

  console.log('--- 3. Mobile Viewport (390x844 iPhone 14) ---')
  await captureViewport('mobile', 390, 844, true)
  console.log('All responsive tests completed!')
}

runAll()

