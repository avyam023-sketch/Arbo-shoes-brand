import { spawn } from 'child_process'
import { writeFileSync } from 'fs'

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--window-size=1440,900',
      '--disable-gpu',
      'http://localhost:5173/',
    ],
    { stdio: 'ignore' }
  )

  await sleep(3000)

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

    await sleep(4000)

    // 1. Add item to bag via catalog quick-size
    console.log('Adding item to bag...')
    await evaluate(`
      const sizeBtn = document.querySelector('.product__quick-sizes button');
      if (sizeBtn) sizeBtn.click();
    `)
    await sleep(1500)

    // 2. Open checkout modal from bag
    console.log('Clicking checkout button in bag...')
    await evaluate(`
      const chkBtn = document.querySelector('.bag__checkout-btn');
      if (chkBtn) chkBtn.click();
    `)
    await sleep(1500)
    await screenshot('C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\f512a6fb-d5b5-4ad6-8eaf-1101194e1d3d\\checkout_step1_shipping.png')

    // 3. Move to Payment Gateway step
    console.log('Moving to payment step...')
    await evaluate(`
      const f = document.querySelector('.checkout-form');
      if (f) f.requestSubmit();
    `)
    await sleep(1500)
    await screenshot('C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\f512a6fb-d5b5-4ad6-8eaf-1101194e1d3d\\checkout_step2_payment.png')

    // 4. Click Authorize & Pay
    console.log('Clicking Pay button...')
    await evaluate(`
      const payBtn = document.querySelector('.checkout-pay-btn');
      if (payBtn) payBtn.click();
    `)
    // Processing takes 2.8s
    await sleep(3800)
    await screenshot('C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\f512a6fb-d5b5-4ad6-8eaf-1101194e1d3d\\checkout_step3_confirmed.png')

    // 5. Click "VIEW IN MY ORDER ARCHIVE"
    console.log('Navigating to user order archive...')
    await evaluate(`
      const viewOrdBtn = document.querySelector('.success-actions .btn--solid');
      if (viewOrdBtn) viewOrdBtn.click();
    `)
    await sleep(1200)
    await screenshot('C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\f512a6fb-d5b5-4ad6-8eaf-1101194e1d3d\\checkout_step4_account_updated.png')

    ws.close()
  } catch (err) {
    console.error('Error:', err)
  } finally {
    chrome.kill()
  }
}

run()
