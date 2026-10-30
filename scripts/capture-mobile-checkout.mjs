import { spawn } from 'child_process'
import { writeFileSync } from 'fs'

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function capture() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--window-size=390,844',
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    })

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

    // Add product to bag
    await evaluate(`
      const sizeBtn = document.querySelector('.product__quick-sizes button');
      if (sizeBtn) sizeBtn.click();
    `)
    await sleep(1000)

    // Click checkout in bag
    await evaluate(`
      const chkBtn = document.querySelector('.bag__checkout-btn');
      if (chkBtn) chkBtn.click();
    `)
    await sleep(1200)

    await screenshot('C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\f512a6fb-d5b5-4ad6-8eaf-1101194e1d3d\\mobile_checkout_active.png')

    // Click continue to payment
    await evaluate(`
      const f = document.querySelector('.checkout-form');
      if (f) f.requestSubmit();
    `)
    await sleep(1200)
    await screenshot('C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\f512a6fb-d5b5-4ad6-8eaf-1101194e1d3d\\mobile_payment_active.png')

    ws.close()
  } catch (err) {
    console.error('Error:', err)
  } finally {
    chrome.kill()
  }
}

capture()

