'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ── LOGO (embedded) ──────────────────────────────────────────
const LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gKgSUNDX1BST0ZJTEUAAQEAAAKQbGNtcwQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtkZXNjAAABCAAAADhjcHJ0AAABQAAAAE53dHB0AAABkAAAABRjaGFkAAABpAAAACxyWFlaAAAB0AAAABRiWFlaAAAB5AAAABRnWFlaAAAB+AAAABRyVFJDAAACDAAAACBnVFJDAAACLAAAACBiVFJDAAACTAAAACBjaHJtAAACbAAAACRtbHVjAAAAAAAAAAEAAAAMZW5VUwAAABwAAAAcAHMAUgBHAEIAIABiAHUAaQBsAHQALQBpAG4AAG1sdWMAAAAAAAAAAQAAAAxlblVTAAAAMgAAABwATgBvACAAYwBvAHAAeQByAGkAZwBoAHQALAAgAHUAcwBlACAAZgByAGUAZQBsAHkAAAAAWFlaIAAAAAAAAPbWAAEAAAAA0y1zZjMyAAAAAAABDEoAAAXj///zKgAAB5sAAP2H///7ov///aMAAAPYAADAlFhZWiAAAAAAAABvlAAAOO4AAAOQWFlaIAAAAAAAACSdAAAPgwAAtr5YWVogAAAAAAAAYqUAALeQAAAY3nBhcmEAAAAAAAMAAAACZmYAAPKnAAANWQAAE9AAAApbcGFyYQAAAAAAAwAAAAJmZgAA8qcAAA1ZAAAT0AAACltwYXJhAAAAAAADAAAAAmZmAADypwAADVkAABPQAAAKW2Nocm0AAAAAAAMAAAAAo9cAAFR7AABMzQAAmZoAACZmAAAPXP/bAEMABQMEBAQDBQQEBAUFBQYHDAgHBwcHDwsLCQwRDxISEQ8RERMWHBcTFBoVEREYIRgaHR0fHx8TFyIkIh4kHB4fHv/bAEMBBQUFBwYHDggIDh4UERQeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHv/CABEIAZABkAMBIgACEQEDEQH/xAAbAAEBAQADAQEAAAAAAAAAAAAAAQIDBAUGB//EABoBAQEBAQEBAQAAAAAAAAAAAAABAgMFBAb/2gAMAwEAAhADEAAAAfyGG6AAAAAsogAAAAAAAAWKSwUEAsAAAAAAAACwALKQAAAAAAAAACwACkWFgAAAAAVAAAAAAAWAABRFgAUQAAAAAAAAAAAAApAAABVlEVRRFElplUJRABAAAAAAAABQBAAABQoVSwWURRFplRFEmoRYRZBZAAAABYAALAAsAAtJpUoKCrWbVSaGbRFGWkZahlqRlRFkRZAACwAALBQIAApFtBSqSroW1lq1htWWi5myYbkZamWZqEWZSUZVGaQSgAAAApAAC1RSrStVnV1uzWt7vHea7cM7KutewOvOzDrTs4y4M82MOKcmczMsxIsyksIsgIAAAssAAC2s2qLRdNmnJuzk32e2uvy/Se/33+f/AKvv3d7+L+W/V+trX5nr9Kun5f8AWfRduPnvy3938PGfyDi/TPnMY+S4+/1+HPq55+PjONqc5ibzlJqEVEEAAVAABRVLU1NVbNdG/Q6P6F9HTf1nYx9308k+e+fT7/ufj36Zmb+d5fg7n7O/E2z7n6L8l+9l+t6vR/Npr9Zn579Bq+z8j9ptfxDpff8AwHwfNjO8fNzmdTKSyIsgIAAAAApdANWNN2NuX0/L310+h/OeJ7fodt30563bqfaeR2+W/O8L1s9M+VfTtnl+71av0vxv0/T5a+cnpumPJ+m+V8byeHZ8/XH5/KZs45krLMsiKiCAACwAKFNFUK00NN3N1eXl4OTte5z9T3ft69/0eLl9v7/l+t9Nn4/n+bv0bM+b7Hubt7vlenxfZ9Hx3B7fgeH8HHx64vj5TGs8ZJqZmVmWZqRFhFmQAFgAAWxpqBpLpbLpbKa5OLk6a7Hs+J2Pr39l2fK9X9B6Hmcfj9bz/l+hnzrE+j5fmO3q/X9XteT9/wBXk+PzdfwfO48XHx4gxJLMpLISyJLAMiwAAFJYKNKC2XS1Ktlq7xrV5+x1ex9GvqvW8j1/0Xo/G9TsdPxfgrjnDHP3PP73bf23jez43tfd8rwc3B+e87jxvPzyTWcyLMpLIgiEAyAAAAAo0oLSqWlNLc6rm5+vzd9fW+v5Hsfo/R+G6XcafgfBgnDPJ3el3e+vufG9nxvc9D5Lh5uH885uMazxzCQmpllZElREsRZAAFlgABYtLLShpGlsVdS1ycvByddfY+z4Pu/pPR+E6PP1/A89JOOeXvef2uuv0HxfZ8D3/Q+X4tcX5vzmbnnlCBMksiAggIAAAAAWKtzqhSkq2WmstN747b2ez5163WZMSsszk1xXV9Hq8M6XWE4yRMwIS5hLISyAgAAAAAABZaqWlg0lpYrVy0qWLCiwFESNZsIIZsgIhAIllgAAAoiwAAAWK0itIFStCgFgoogsIsSAiEKgQgIlAAAACxRLAAACkrTNq2CpSUolKgqAIubACACIIAAFIAAAAAAAABYqoNCgLAsAAAQJYQBYgAAAFgAAFIBZRLAAAACopYKgpCoLAsAIAlAAAAAAAAUiwLBYLAAAAAAAAAAAAAAAAAAAAAAAAAAAFIAAAAAAAAAAAAACwAAAAAAAAAKBAAAAAAAAAAAAAAAAA//"

// ════════════════════════════════════════════════════════════
//  CONFIG & CONSTANTS
// ════════════════════════════════════════════════════════════
const RPC_URL     = "https://api.mainnet-beta.solana.com"
const GECKO_API   = "https://api.geckoterminal.com/api/v2"
const JUPITER_API = "https://quote-api.jup.ag/v6"
const PRINTR_MCP  = "https://api.printr.xyz/mcp"
const SOL_MINT    = "So11111111111111111111111111111111111111112"
const TOKEN_PROG  = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"

const TOKENS: Record<string, {symbol:string;name:string;decimals:number}> = {
  [SOL_MINT]:                                        {symbol:"SOL",  name:"Solana",       decimals:9},
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v":  {symbol:"USDC", name:"USD Coin",      decimals:6},
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB":   {symbol:"USDT", name:"Tether",        decimals:6},
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So":   {symbol:"mSOL", name:"Marinade SOL",  decimals:9},
  "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj":   {symbol:"stSOL",name:"Lido stSOL",    decimals:9},
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN":    {symbol:"JUP",  name:"Jupiter",       decimals:6},
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263":   {symbol:"BONK", name:"Bonk",          decimals:5},
}

const st = {
  g: (k: string, d: unknown = {}) => { try { return JSON.parse(localStorage.getItem("sai_"+k)||"null") ?? d } catch { return d } },
  s: (k: string, v: unknown)       => { try { localStorage.setItem("sai_"+k, JSON.stringify(v)) } catch {} },
}

// ════════════════════════════════════════════════════════════
//  API LAYER
// ════════════════════════════════════════════════════════════
const rpc = async (method: string, params: unknown[] = [], url = RPC_URL): Promise<any> => {
  const r = await fetch(url, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({jsonrpc:"2.0",id:1,method,params}),
  })
  if (!r.ok) throw new Error(`RPC ${method} HTTP ${r.status}`)
  const d = await r.json()
  if (d.error) throw new Error(d.error.message)
  return d.result
}

const api = {
  solBalance: async (addr: string, url?: string) =>
    (await rpc("getBalance", [addr, {commitment:"confirmed"}], url)).value / 1e9,

  tokenAccs: async (addr: string, url?: string) => {
    const r = await rpc("getTokenAccountsByOwner",
      [addr, {programId:TOKEN_PROG}, {encoding:"jsonParsed",commitment:"confirmed"}], url)
    return (r.value||[]).map((a: any) => ({
      mint:     a.account.data.parsed.info.mint,
      amount:   a.account.data.parsed.info.tokenAmount.uiAmount || 0,
      decimals: a.account.data.parsed.info.tokenAmount.decimals,
    })).filter((t: any) => t.amount > 0)
  },

  recentTxns: async (addr: string, url?: string) => {
    const s = await rpc("getSignaturesForAddress",
      [addr, {limit:5,commitment:"confirmed"}], url).catch(() => [])
    return (s||[]).map((x: any) => ({
      sig:  x.signature,
      ok:   !x.err,
      time: x.blockTime
        ? new Date(x.blockTime*1000).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})
        : "—",
    }))
  },

  prices: async (mints: string[]) => {
    const res: Record<string,string> = {}
    for (let i = 0; i < mints.length; i += 29) {
      try {
        const r = await fetch(`${GECKO_API}/simple/networks/solana/token_price/${mints.slice(i,i+29).join(",")}`)
        if (!r.ok) continue
        const d = await r.json()
        Object.assign(res, d.data?.attributes?.token_prices || {})
      } catch {}
    }
    return res
  },

  tokenData: async (mint: string) => {
    const r = await fetch(`${GECKO_API}/networks/solana/tokens/${mint}`)
    if (!r.ok) throw new Error("Token not found on GeckoTerminal")
    const { data: { attributes: a } } = await r.json()
    return {
      name: a.name, symbol: a.symbol, address: a.address,
      price_usd: parseFloat(a.price_usd||0),
      fdv: a.fdv_usd, vol24: a.volume_usd?.h24,
      ch24: a.price_change_percentage?.h24,
      ch7d: a.price_change_percentage?.d7,
    }
  },

  topPools: async (mint: string) => {
    const r = await fetch(`${GECKO_API}/networks/solana/tokens/${mint}/pools?page=1`)
    if (!r.ok) return []
    const d = await r.json()
    return (d.data||[]).slice(0,3).map((p: any) => ({
      name: p.attributes?.name,
      liq:  p.attributes?.reserve_in_usd,
      vol:  p.attributes?.volume_usd?.h24,
    }))
  },

  jupQuote: async (inMint: string, outMint: string, amount: number, slipBps = 50) => {
    const p = new URLSearchParams({
      inputMint:    inMint,
      outputMint:   outMint,
      amount:       String(Math.floor(amount)),
      slippageBps:  String(slipBps),
    })
    const r = await fetch(`${JUPITER_API}/quote?${p}`)
    if (!r.ok) throw new Error("Jupiter quote failed")
    return r.json()
  },

  mcp: async (action: string, payload: unknown, key: string) => {
    if (!key) throw new Error("Printr API key not configured. Add it in Settings.")
    const r = await fetch(PRINTR_MCP, {
      method: "POST",
      headers: {"Content-Type":"application/json","X-Partner-Key":key},
      body: JSON.stringify({action, payload}),
    })
    if (!r.ok) throw new Error(`Printr MCP ${r.status}: ${await r.text().catch(()=>"")}`)
    return r.json()
  },
}

// ════════════════════════════════════════════════════════════
//  TOOLS
// ════════════════════════════════════════════════════════════
const TOOLS = [
  {name:"wallet_analyzer",   description:"Fetch live Solana wallet data: SOL balance, all SPL token balances with live USD prices, recent transactions.",input_schema:{type:"object",properties:{address:{type:"string"}},required:[]}},
  {name:"portfolio_analyzer",description:"Analyze portfolio allocation, risk, USD exposure. Requires wallet_analyzer first.",input_schema:{type:"object",properties:{},required:[]}},
  {name:"token_intelligence",description:"Real-time token data from GeckoTerminal: price, market cap, volume, liquidity, 24h/7d price change.",input_schema:{type:"object",properties:{token:{type:"string"}},required:["token"]}},
  {name:"swap_executor",     description:"Get a live swap quote from Jupiter Aggregator v6.",input_schema:{type:"object",properties:{input_token:{type:"string"},output_token:{type:"string"},amount:{type:"number"},slippage_bps:{type:"number"}},required:["input_token","output_token","amount"]}},
  {name:"transfer_executor", description:"Build a SOL or SPL token transfer with live USD value.",input_schema:{type:"object",properties:{token:{type:"string"},amount:{type:"number"},recipient:{type:"string"},memo:{type:"string"}},required:["token","amount","recipient"]}},
  {name:"mcp_executor",      description:"Execute via Printr MCP.",input_schema:{type:"object",properties:{action:{type:"string",enum:["get_quote","create_token","track_deployment","distribute_rewards","stake_via_mcp","get_mcp_extensions"]},payload:{type:"object"}},required:["action","payload"]}},
  {name:"staking_manager",   description:"Manage staking: compare pools, get positions, stake/unstake.",input_schema:{type:"object",properties:{action:{type:"string",enum:["compare_pools","get_positions","stake","unstake","claim_rewards","optimize","auto_compound"]},token:{type:"string"},amount:{type:"number"},protocol:{type:"string"}},required:["action"]}},
  {name:"strategy_simulator",description:"Simulate DeFi strategies with projected ROI.",input_schema:{type:"object",properties:{strategy:{type:"string",enum:["staking_yield","dca","rebalance","yield_farming","compound_growth"]},amount:{type:"number"},duration_days:{type:"number"}},required:["strategy","amount","duration_days"]}},
]

const SYSTEM = `You are SAISEN — a production Web3 execution agent for Solana.
ALWAYS use tools — never fabricate numbers or prices.
KEY RULES:
- wallet_analyzer: Call whenever user asks about wallet, balance, portfolio, or tokens
- token_intelligence: Use for any price, market cap, liquidity question
- swap_executor: Builds REAL Jupiter v6 quote with live pricing
- Always show USD value alongside token amounts
- Flag: price impact >1%, liquidity <$500K, unknown tokens
Style: Concise, data-driven, **bold** for key figures. No fluff.`

// ════════════════════════════════════════════════════════════
//  EXECUTOR FACTORY
// ════════════════════════════════════════════════════════════
const makeExec = (
  walletAddr: string,
  rpcUrl: string,
  printrKey: string,
  cache: any,
  setCache: (v: any) => void,
) => ({
  wallet_analyzer: async (inp: any) => {
    const addr = inp?.address || walletAddr
    if (!addr) return {error:"No wallet connected. Click 'Connect Wallet' first."}
    const [sol, accs, txns] = await Promise.all([
      api.solBalance(addr, rpcUrl),
      api.tokenAccs(addr, rpcUrl).catch(() => []),
      api.recentTxns(addr, rpcUrl).catch(() => []),
    ])
    const mints = [SOL_MINT, ...(accs as any[]).map((a:any)=>a.mint)]
    const px = await api.prices(mints).catch(() => ({})) as Record<string,string>
    const solPx = parseFloat(px[SOL_MINT]||"0")
    const tokens = [
      {mint:SOL_MINT, symbol:"SOL", name:"Solana", amount:sol, price_usd:solPx, value_usd:sol*solPx},
      ...(accs as any[]).map((a:any) => {
        const m = TOKENS[a.mint] || {}
        const p = parseFloat(px[a.mint]||"0")
        return {mint:a.mint, symbol:(m as any).symbol||"???", name:(m as any).name||a.mint.slice(0,8)+"…", amount:a.amount, price_usd:p, value_usd:a.amount*p}
      }),
    ].filter((t:any) => t.amount > 0)
    const total = tokens.reduce((s:number,t:any) => s+t.value_usd, 0)
    const out = {
      address: addr,
      sol_balance: (sol as number).toFixed(6),
      sol_price_usd: solPx,
      total_usd: total.toFixed(2),
      token_count: tokens.length,
      tokens: tokens.map((t:any) => ({
        ...t,
        value_usd: t.value_usd.toFixed(2),
        alloc_pct: total > 0 ? ((t.value_usd/total)*100).toFixed(1) : "0",
      })),
      recent_txns: txns,
      source: "Solana RPC + GeckoTerminal",
      ts: new Date().toISOString(),
    }
    setCache(out)
    return out
  },

  portfolio_analyzer: async () => {
    if (!cache?.tokens) return {error:"Run wallet_analyzer first."}
    const t = cache.tokens
    const total = parseFloat(cache.total_usd||"0")
    const stableUSD = t.filter((x:any)=>["USDC","USDT"].includes(x.symbol)).reduce((s:number,x:any)=>s+parseFloat(x.value_usd||"0"),0)
    const stakeUSD  = t.filter((x:any)=>["mSOL","stSOL"].includes(x.symbol)).reduce((s:number,x:any)=>s+parseFloat(x.value_usd||"0"),0)
    const recs: string[] = []
    const solVal = parseFloat(t.find((x:any)=>x.symbol==="SOL")?.value_usd||"0")
    if (solVal/total > 0.6) recs.push("SOL >60% of portfolio — consider diversifying 10–15% into stablecoins.")
    if (stableUSD/total < 0.1) recs.push("Low stablecoin allocation (<10%). Maintain 15–20% for rebalancing.")
    if (stakeUSD === 0) recs.push("No liquid staking detected. Staking SOL earns ~6–8% APR (mSOL/stSOL).")
    return {
      total_usd: cache.total_usd,
      stable_usd: stableUSD.toFixed(2),
      stake_usd: stakeUSD.toFixed(2),
      allocation: t.map((x:any)=>({symbol:x.symbol,pct:x.alloc_pct,usd:x.value_usd,risk:["USDC","USDT"].includes(x.symbol)?"LOW":["SOL","mSOL"].includes(x.symbol)?"MEDIUM":"HIGH"})),
      recommendations: recs.length ? recs : ["Portfolio balanced. Monitor concentration and rebalance if any asset exceeds 60%."],
      source: "Computed from live wallet data",
      ts: new Date().toISOString(),
    }
  },

  token_intelligence: async (inp: any) => {
    const sym = inp.token.toUpperCase()
    let mint = inp.token
    const found = Object.entries(TOKENS).find(([,v])=>v.symbol===sym)
    if (found) mint = found[0]
    const [tok, pools] = await Promise.all([api.tokenData(mint), api.topPools(mint).catch(()=>[])])
    const liq = (pools as any[]).reduce((s:number,p:any)=>s+parseFloat(p.liq||"0"),0)
    const risk = liq < 500_000 ? "HIGH" : liq < 5_000_000 ? "MEDIUM" : "LOW"
    return {
      ...tok, top_pools:pools,
      liquidity_usd: liq.toFixed(0),
      risk_level: risk,
      warning: risk==="HIGH" ? "⚠ Low liquidity — exercise caution." : null,
      source: "GeckoTerminal API",
      ts: new Date().toISOString(),
    }
  },

  swap_executor: async (inp: any) => {
    const res = (sym: string) => { const e = Object.entries(TOKENS).find(([,v])=>v.symbol===sym.toUpperCase()); return e?e[0]:sym }
    const inMint = res(inp.input_token), outMint = res(inp.output_token)
    const inMeta = TOKENS[inMint]||{} as any, outMeta = TOKENS[outMint]||{} as any
    const inAmt = inp.amount * Math.pow(10, inMeta.decimals ?? 9)
    const q = await api.jupQuote(inMint, outMint, inAmt, inp.slippage_bps||50)
    const outAmt = parseInt(q.outAmount||"0") / Math.pow(10, outMeta.decimals ?? 9)
    const impact = parseFloat(q.priceImpactPct||"0") * 100
    const route = (q.routePlan||[]).map((r:any)=>r.swapInfo?.label||"DEX").join(" → ") || "Direct"
    return {
      input_token: inp.input_token.toUpperCase(),
      output_token: inp.output_token.toUpperCase(),
      in_amount: inp.amount,
      out_amount: outAmt.toFixed(6),
      price_impact: impact.toFixed(3)+"%",
      slippage_pct: ((inp.slippage_bps||50)/100).toFixed(2)+"%",
      route,
      min_output: (outAmt*(1-(inp.slippage_bps||50)/10000)).toFixed(6),
      requires_confirmation: true,
      warning: impact > 1 ? `High price impact (${impact.toFixed(2)}%). Consider splitting.` : null,
      source: "Jupiter Aggregator v6",
      ts: new Date().toISOString(),
    }
  },

  transfer_executor: async (inp: any) => {
    const sym = inp.token.toUpperCase()
    const entry = Object.entries(TOKENS).find(([,v])=>v.symbol===sym)
    const mint = entry ? entry[0] : null
    const px = mint ? await api.prices([mint]).catch(()=>({})) as Record<string,string> : {}
    const price = mint ? parseFloat(px[mint]||"0") : 0
    return {
      token: sym, amount: inp.amount,
      usd_value: (inp.amount*price).toFixed(2),
      recipient: inp.recipient, memo: inp.memo||null,
      estimated_fee: "~0.000005 SOL",
      requires_confirmation: true,
      source: "Built for Solana mainnet",
      ts: new Date().toISOString(),
    }
  },

  mcp_executor: async (inp: any) => {
    const result = await api.mcp(inp.action, inp.payload, printrKey)
    return {action:inp.action, result, source:"Printr MCP", ts:new Date().toISOString()}
  },

  staking_manager: async (inp: any) => {
    if (inp.action === "compare_pools") return {
      pools: [
        {protocol:"Jito",    token:"SOL",     est_apr:"~8.1%",  tvl:"$2.1B+",  risk:"LOW",    liquid:true,  note:"Highest APR. MEV rewards."},
        {protocol:"Marinade",token:"SOL",     est_apr:"~7.2%",  tvl:"$1.4B+",  risk:"LOW",    liquid:true,  note:"Liquid mSOL. Battle-tested."},
        {protocol:"Lido",    token:"SOL",     est_apr:"~6.8%",  tvl:"$880M+",  risk:"LOW",    liquid:true,  note:"Liquid stSOL. Ethereum team."},
        {protocol:"Orca",    token:"USDC/SOL",est_apr:"~12–18%",tvl:"$200M+",  risk:"MEDIUM", liquid:false, note:"LP yield. Impermanent loss risk."},
      ],
      best: "Jito offers the highest liquid-staking APR with top TVL.",
      source: "Protocol documentation",
      ts: new Date().toISOString(),
    }
    if (inp.action === "get_positions") {
      if (!cache?.tokens) return {error:"Connect wallet and run wallet_analyzer first."}
      const stk = cache.tokens.filter((t:any)=>["mSOL","stSOL","jitoSOL","bSOL"].includes(t.symbol))
      return {
        positions: stk,
        total_staked_usd: stk.reduce((s:number,t:any)=>s+parseFloat(t.value_usd||"0"),0).toFixed(2),
        source: "Live wallet data",
        ts: new Date().toISOString(),
      }
    }
    return {
      action: inp.action, protocol: inp.protocol||"chosen protocol", amount: inp.amount,
      instructions: "Use mcp_executor with stake_via_mcp, or visit the protocol website. Wallet signature required.",
      requires_confirmation: true, mcp_action: "stake_via_mcp",
      ts: new Date().toISOString(),
    }
  },

  strategy_simulator: async (inp: any) => {
    const rates: Record<string,number> = {staking_yield:.072,dca:.050,rebalance:.055,yield_farming:.16,compound_growth:.092}
    const r = rates[inp.strategy]||.07
    const d = r/365
    const fin = inp.amount * Math.pow(1+d, inp.duration_days)
    const prof = fin - inp.amount
    return {
      strategy: inp.strategy, initial: inp.amount, days: inp.duration_days,
      final_usd: fin.toFixed(2), profit_usd: prof.toFixed(2),
      roi: ((prof/inp.amount)*100).toFixed(2)+"%",
      apr: (r*100).toFixed(1)+"%",
      breakpoints: [.25,.5,.75,1].map(p=>({
        day: Math.floor(inp.duration_days*p),
        val: (inp.amount*Math.pow(1+d,Math.floor(inp.duration_days*p))).toFixed(2),
      })),
      disclaimer: "Indicative only. DeFi carries smart contract and market risk.",
      source: "Computed",
      ts: new Date().toISOString(),
    }
  },
})

// ════════════════════════════════════════════════════════════
//  CSS
// ════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden}
:root{
  --bg:#06060f;--bg1:#0a0a1a;--bg2:#0d0d22;
  --p1:#9f5fff;--p2:#b97fff;--p3:rgba(159,95,255,.1);
  --b1:#3b82f6;--b2:#60a5fa;
  --g1:#10b981;--g2:#34d399;--g3:#4ade80;
  --r1:#f43f5e;--r2:#f87171;
  --a1:#f59e0b;--a2:#fbbf24;
  --c1:#06b6d4;--c2:#22d3ee;
  --t1:#e2e8f0;--t2:rgba(255,255,255,.55);--t3:rgba(255,255,255,.27);
  --brd:rgba(159,95,255,.12);--brd2:rgba(159,95,255,.26);--brd3:rgba(159,95,255,.5);
  --dsp:'Orbitron',monospace;--mono:'Share Tech Mono',monospace;--body:'Rajdhani',sans-serif;
  --hdr:56px;--bnav:60px;--r8:8px;--r12:12px;--r16:16px;
}
.sc::-webkit-scrollbar{width:2px;height:2px}
.sc::-webkit-scrollbar-thumb{background:rgba(159,95,255,.28);border-radius:2px}
.sc::-webkit-scrollbar-track{background:transparent}
@keyframes grid-move{0%{background-position:0 0}100%{background-position:52px 52px}}
@keyframes glow-ring{0%,100%{box-shadow:0 0 0 0 rgba(159,95,255,0),0 0 16px rgba(159,95,255,.25)}50%{box-shadow:0 0 0 3px rgba(159,95,255,.12),0 0 28px rgba(159,95,255,.5)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes msg-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes blink-dot{0%,100%{opacity:.2;transform:scale(.75)}50%{opacity:1;transform:scale(1.12)}}
@keyframes flick{0%,100%{opacity:1}92%{opacity:.55}94%{opacity:.85}}
@keyframes panel-in{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes modal-in{from{opacity:0;transform:scale(.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes scan{0%{top:-2px}100%{top:100%}}
.msg-a{animation:msg-in .22s ease-out both}
.panel-a{animation:panel-in .26s ease-out both}
.modal-a{animation:modal-in .2s cubic-bezier(.34,1.56,.64,1) both}
.td{animation:blink-dot 1.1s ease-in-out infinite}
.sp{animation:spin .8s linear infinite}
.fl{animation:flick 8s ease-in-out infinite}
.gr{animation:glow-ring 2.5s ease-in-out infinite}
.md strong{color:var(--p2);font-weight:700}
.md code{background:rgba(159,95,255,.13);border:1px solid rgba(159,95,255,.22);border-radius:4px;padding:1px 6px;font-size:12px;font-family:var(--mono);color:var(--p2)}
.md ul{padding-left:16px;margin:5px 0;display:flex;flex-direction:column;gap:3px}
.md li{color:var(--t2);font-size:13px;line-height:1.6}
.md li::marker{color:var(--p1)}
.md p{margin:4px 0;line-height:1.68;color:var(--t1);font-size:14px}
.md h3{font-family:var(--dsp);font-size:11px;font-weight:700;color:var(--p2);margin:10px 0 4px;letter-spacing:.1em}
.chat-inp{flex:1;background:rgba(255,255,255,.04);border:1px solid var(--brd);border-radius:var(--r12);color:var(--t1);font-family:var(--body);font-size:14px;font-weight:500;padding:11px 15px;outline:none;resize:none;line-height:1.5;min-height:44px;max-height:120px;transition:border-color .2s,background .2s;display:block;width:100%}
.chat-inp:focus{border-color:var(--brd3);background:rgba(159,95,255,.06)}
.chat-inp::placeholder{color:var(--t3)}
.chat-inp:disabled{opacity:.4;cursor:not-allowed}
.btn{cursor:pointer;font-family:var(--dsp);font-weight:700;letter-spacing:.07em;transition:all .15s;display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:var(--r8);border:none;white-space:nowrap;user-select:none}
.btn:disabled{opacity:.3;cursor:not-allowed;pointer-events:none}
.btn-p{background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;padding:9px 20px;font-size:11px;box-shadow:0 4px 18px rgba(124,58,237,.3)}
.btn-p:hover{filter:brightness(1.18);transform:translateY(-1px);box-shadow:0 6px 26px rgba(124,58,237,.48)}
.btn-g{background:linear-gradient(135deg,#059669,#047857);color:#fff;padding:9px 20px;font-size:11px}
.btn-g:hover{filter:brightness(1.15);transform:translateY(-1px)}
.btn-gh{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:var(--t2);padding:7px 13px;font-size:11px}
.btn-gh:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.2);color:var(--t1)}
.send-btn{background:linear-gradient(135deg,#7c3aed,#5b21b6);border:none;color:#fff;border-radius:var(--r12);width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s;font-size:19px;box-shadow:0 4px 18px rgba(124,58,237,.35)}
.send-btn:hover{filter:brightness(1.2);transform:scale(1.06)}
.send-btn:disabled{opacity:.3;cursor:not-allowed;transform:none;filter:none;box-shadow:none}
.qa-pill{background:rgba(159,95,255,.07);border:1px solid rgba(159,95,255,.18);color:var(--t2);border-radius:999px;padding:6px 14px;font-size:11px;font-family:var(--body);font-weight:600;cursor:pointer;white-space:nowrap;transition:all .16s;letter-spacing:.03em;flex-shrink:0}
.qa-pill:hover{background:rgba(159,95,255,.16);border-color:var(--brd2);color:var(--p2);transform:translateY(-1px)}
.qa-pill:disabled{opacity:.3;cursor:not-allowed;pointer-events:none}
.card{background:rgba(255,255,255,.03);border:1px solid var(--brd);border-radius:var(--r12)}
.card-h{transition:border-color .18s,background .18s}
.card-h:hover{border-color:var(--brd2);background:rgba(159,95,255,.04)}
.row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px}
.row:last-child{border-bottom:none}
.tab-btn{flex:1;padding:10px 4px;font-size:9px;font-family:var(--dsp);font-weight:700;letter-spacing:.12em;border:none;cursor:pointer;background:transparent;color:var(--t3);border-bottom:2px solid transparent;transition:all .18s;text-transform:uppercase}
.tab-btn.active{color:var(--p2);border-color:var(--p1);background:rgba(159,95,255,.04)}
.tab-btn:hover:not(.active){color:var(--t2);background:rgba(255,255,255,.03)}
.status-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.tool-card{background:rgba(255,255,255,.025);border-radius:var(--r12);padding:12px 14px;margin-top:7px;border-left:2px solid}
.app{display:grid;grid-template-rows:var(--hdr) 1fr;grid-template-columns:1fr;height:100vh;background:var(--bg);color:var(--t1);position:relative;overflow:hidden}
@media(min-width:768px){
  .app.side-open{grid-template-columns:1fr 264px;grid-template-rows:var(--hdr) 1fr;grid-template-areas:"header header" "chat panel"}
  .app.side-closed{grid-template-columns:1fr;grid-template-rows:var(--hdr) 1fr;grid-template-areas:"header" "chat"}
  .app-header{grid-area:header}.chat-area{grid-area:chat}.side-panel{grid-area:panel}
  .bottom-nav{display:none!important}.desktop-toggle{display:inline-flex!important}
}
@media(max-width:767px){
  .app{grid-template-rows:var(--hdr) 1fr var(--bnav);grid-template-areas:"header" "main" "bnav"}
  .app-header{grid-area:header}.chat-area{grid-area:main;display:flex;flex-direction:column;min-height:0}
  .side-panel{display:none!important}.bottom-nav{grid-area:bnav!important;display:flex!important}
  .desktop-toggle{display:none!important}
}
.app-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
.app-bg-grid{position:absolute;inset:0;opacity:.04;background-image:linear-gradient(rgba(159,95,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(159,95,255,.7) 1px,transparent 1px);background-size:52px 52px;animation:grid-move 8s linear infinite}
.app-bg-glow{position:absolute;inset:0;background:radial-gradient(ellipse 65% 55% at 50% 30%,rgba(124,58,237,.07) 0%,transparent 70%)}
.app-bg-scan{position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(159,95,255,.35),transparent);animation:scan 12s linear infinite}
.app-header,.chat-area,.side-panel,.bottom-nav{position:relative;z-index:1}
`

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════
const uid   = () => Math.random().toString(36).slice(2,8)
const tstmp = () => new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
const fUSD  = (v: any) => v == null ? "—" : "$"+parseFloat(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})
const fAmt  = (v: any, d = 4) => v == null ? "—" : parseFloat(v).toLocaleString(undefined,{maximumFractionDigits:d})

const renderMd = (t: string) => {
  if (!t) return ""
  let r = t
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^###? (.+)$/gm, "<h3>$1</h3>")
    .replace(/^[-•*] (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
  r = r.replace(/(<li>[\s\S]*?<\/li>\s*)+/g, (m: string) => `<ul>${m}</ul>`)
  return r.split(/\n\n+/).map((c: string) => {
    c = c.trim()
    if (!c) return ""
    if (/^<[uh3]/.test(c)) return c
    return `<p>${c.replace(/\n/g,"<br/>")}</p>`
  }).join("")
}

const TMETA: Record<string,{l:string;c:string}> = {
  wallet_analyzer:    {l:"Live Wallet",   c:"#3b82f6"},
  portfolio_analyzer: {l:"Portfolio",     c:"#9f5fff"},
  token_intelligence: {l:"Token Intel",   c:"#f59e0b"},
  swap_executor:      {l:"Jupiter Quote", c:"#10b981"},
  transfer_executor:  {l:"Transfer",      c:"#f43f5e"},
  mcp_executor:       {l:"Printr MCP",    c:"#06b6d4"},
  staking_manager:    {l:"Staking",       c:"#9f5fff"},
  strategy_simulator: {l:"Simulation",    c:"#4ade80"},
}

// ════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ════════════════════════════════════════════════════════════
function UserAvatar({size=36}:{size?:number}) {
  return (
    <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,
      background:"linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#9f5fff 100%)",
      border:"1px solid rgba(159,95,255,.4)",boxShadow:"0 0 12px rgba(79,70,229,.28)",
      display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:"var(--dsp)",fontSize:size*.38,fontWeight:700,color:"#fff",lineHeight:1,userSelect:"none"}}>
      U
    </div>
  )
}

function AgentAvatar({size=36,glow=false}:{size?:number;glow?:boolean}) {
  return (
    <div className={glow?"gr":""} style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"1px solid rgba(159,95,255,.35)"}}>
      <img src={LOGO} alt="SAISEN" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
    </div>
  )
}

function ToolCard({name,result,onConfirm}:{name:string;result:any;onConfirm?:(n:string,r:any)=>void}) {
  const m = TMETA[name]||{l:name,c:"#9f5fff"}
  if (result?.error) return (
    <div className="tool-card" style={{borderLeftColor:m.c}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
        <span style={{width:5,height:5,borderRadius:"50%",background:m.c}}/>
        <span style={{fontFamily:"var(--dsp)",fontSize:9,color:m.c,letterSpacing:".16em"}}>{m.l}</span>
      </div>
      <div style={{background:"rgba(244,63,94,.07)",border:"1px solid rgba(244,63,94,.2)",borderRadius:8,padding:"8px 12px",fontSize:13,color:"var(--r2)"}}>
        <strong>Error:</strong> {result.error}
      </div>
    </div>
  )

  const body = () => {
    if (name==="wallet_analyzer") return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)"}}>{result.address?.slice(0,12)}…</span>
          <span style={{fontFamily:"var(--dsp)",fontSize:16,fontWeight:900,color:"var(--g3)"}}>{fUSD(result.total_usd)}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
          {([["SOL",result.sol_balance,"var(--p2)"],["Tokens",result.token_count,"var(--b2)"],["Price",fUSD(result.sol_price_usd),"var(--a2)"]] as [string,any,string][]).map(([l,v,c])=>(
            <div key={l} style={{background:"rgba(0,0,0,.3)",borderRadius:8,padding:"7px",textAlign:"center"}}>
              <div style={{fontFamily:"var(--dsp)",fontSize:13,fontWeight:900,color:c,lineHeight:1.2}}>{v}</div>
              <div style={{fontSize:9,color:"var(--t3)",marginTop:2,letterSpacing:".08em"}}>{l}</div>
            </div>
          ))}
        </div>
        <div className="sc" style={{maxHeight:148,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
          {result.tokens?.map((t:any,i:number)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 7px",borderRadius:7,background:"rgba(0,0,0,.25)"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:`rgba(${i%3===0?"159,95,255":i%3===1?"59,130,246":"16,185,129"},.18)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"var(--dsp)",fontWeight:700,color:"var(--t2)",flexShrink:0}}>
                {t.symbol?.slice(0,2)||"??"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"var(--dsp)",fontSize:11,fontWeight:700,color:"var(--t1)"}}>{t.symbol}</div>
                <div style={{fontSize:10,color:"var(--t3)",marginTop:1}}>{fAmt(t.amount,6)}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>{fUSD(t.value_usd)}</div>
                <div style={{fontSize:10,color:"var(--t3)"}}>{t.alloc_pct}%</div>
              </div>
            </div>
          ))}
        </div>
        {result.recent_txns?.length > 0 && (
          <div style={{marginTop:10}}>
            <div style={{fontSize:9,fontFamily:"var(--dsp)",color:"var(--t3)",letterSpacing:".14em",marginBottom:5}}>RECENT TXN</div>
            {result.recent_txns.slice(0,3).map((tx:any,i:number)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:tx.ok?"var(--g1)":"var(--r1)",flexShrink:0}}/>
                <a href={`https://solscan.io/tx/${tx.sig}`} target="_blank" rel="noreferrer"
                  style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--b2)",textDecoration:"none",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {tx.sig?.slice(0,18)}…
                </a>
                <span style={{fontSize:10,color:"var(--t3)",flexShrink:0}}>{tx.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )

    if (name==="token_intelligence") return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontFamily:"var(--dsp)",fontSize:18,fontWeight:900,color:"var(--t1)"}}>{fUSD(result.price_usd)}</div>
            <div style={{fontSize:12,marginTop:2}}>
              <span style={{color:parseFloat(result.ch24||0)>=0?"var(--g2)":"var(--r2)"}}>{parseFloat(result.ch24||0).toFixed(2)}% 24h</span>
              {result.ch7d && <span style={{color:"var(--t3)",marginLeft:8}}>{parseFloat(result.ch7d||0).toFixed(2)}% 7d</span>}
            </div>
          </div>
          <span style={{
            background:({"LOW":"rgba(16,185,129,.1)","MEDIUM":"rgba(245,158,11,.1)","HIGH":"rgba(244,63,94,.1)"}[result.risk_level as string])||"rgba(245,158,11,.1)",
            border:`1px solid ${({"LOW":"rgba(16,185,129,.28)","MEDIUM":"rgba(245,158,11,.28)","HIGH":"rgba(244,63,94,.28)"}[result.risk_level as string])||"rgba(245,158,11,.28)"}`,
            color:({"LOW":"var(--g2)","MEDIUM":"var(--a2)","HIGH":"var(--r2)"}[result.risk_level as string])||"var(--a2)",
            borderRadius:5,padding:"3px 8px",fontSize:9,fontFamily:"var(--dsp)",letterSpacing:".1em"}}>
            {result.risk_level}
          </span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {([["Mkt Cap",result.fdv?fUSD(result.fdv):"—"],["Vol 24h",result.vol24?fUSD(result.vol24):"—"],["Liquidity",fUSD(result.liquidity_usd)],["Pools",result.top_pools?.length||"—"]] as [string,any][]).map(([l,v])=>(
            <div key={l} style={{background:"rgba(0,0,0,.3)",borderRadius:7,padding:"7px 9px"}}>
              <div style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>{v}</div>
              <div style={{fontSize:9,color:"var(--t3)",marginTop:1,letterSpacing:".08em"}}>{l}</div>
            </div>
          ))}
        </div>
        {result.warning && <div style={{marginTop:8,fontSize:11,color:"var(--a2)",padding:"5px 9px",background:"rgba(245,158,11,.06)",borderRadius:6}}>{result.warning}</div>}
      </div>
    )

    if (name==="swap_executor") return (
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,padding:"10px 0",marginBottom:8}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"var(--dsp)",fontSize:19,fontWeight:900,color:"var(--t1)"}}>{result.in_amount}</div>
            <div style={{fontSize:10,color:"var(--t3)",marginTop:2}}>{result.input_token}</div>
          </div>
          <span style={{color:"var(--p2)",fontSize:22}}>→</span>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"var(--dsp)",fontSize:19,fontWeight:900,color:"var(--g3)"}}>{result.out_amount}</div>
            <div style={{fontSize:10,color:"var(--t3)",marginTop:2}}>{result.output_token}</div>
          </div>
        </div>
        {([["Impact",result.price_impact,parseFloat(result.price_impact)>1?"var(--r2)":"var(--g2)"],["Slippage",result.slippage_pct,"var(--t2)"],["Route",result.route,"var(--b2)"],["Min Out",result.min_output+" "+result.output_token,"var(--t2)"]] as [string,any,string][]).map(([l,v,c])=>(
          <div className="row" key={l}>
            <span style={{color:"var(--t3)",fontSize:12}}>{l}</span>
            <span style={{color:c,fontSize:12,fontWeight:600,textAlign:"right",maxWidth:"65%",overflow:"hidden",textOverflow:"ellipsis"}}>{v}</span>
          </div>
        ))}
        {result.warning && <div style={{marginTop:8,padding:"6px 10px",background:"rgba(244,63,94,.07)",border:"1px solid rgba(244,63,94,.2)",borderRadius:7,fontSize:11,color:"var(--r2)"}}>⚠ {result.warning}</div>}
      </div>
    )

    if (name==="staking_manager" && result.pools) return (
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {result.pools.map((p:any,i:number)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:9,
            background:i===0?"rgba(159,95,255,.08)":"rgba(0,0,0,.22)",
            border:i===0?"1px solid var(--brd2)":"1px solid rgba(255,255,255,.05)"}}>
            {i===0 && <span style={{fontSize:8,background:"rgba(159,95,255,.2)",color:"var(--p2)",borderRadius:4,padding:"1px 5px",fontFamily:"var(--dsp)",flexShrink:0}}>BEST</span>}
            <span style={{flex:1,fontFamily:"var(--dsp)",fontSize:11,fontWeight:700,color:"var(--t1)"}}>{p.protocol}</span>
            <span style={{fontFamily:"var(--dsp)",fontSize:13,fontWeight:900,color:"var(--g3)"}}>{p.est_apr}</span>
            <span style={{fontSize:10,color:"var(--t3)"}}>{p.tvl}</span>
          </div>
        ))}
        {result.best && <div style={{marginTop:5,fontSize:11,color:"var(--b2)",padding:"6px 10px",background:"rgba(59,130,246,.06)",borderRadius:7}}>{result.best}</div>}
      </div>
    )

    if (name==="strategy_simulator") return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:10}}>
          {([["Initial",fUSD(result.initial),"var(--t2)"],["Final",fUSD(result.final_usd),"var(--g3)"],["ROI",result.roi,"var(--p2)"]] as [string,any,string][]).map(([l,v,c])=>(
            <div key={l} style={{background:"rgba(0,0,0,.3)",borderRadius:8,padding:"8px",textAlign:"center"}}>
              <div style={{fontFamily:"var(--dsp)",fontSize:13,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontSize:9,color:"var(--t3)",marginTop:2,letterSpacing:".08em"}}>{l}</div>
            </div>
          ))}
        </div>
        {result.breakpoints?.map((b:any,i:number)=>(
          <div className="row" key={i}>
            <span style={{color:"var(--t3)",fontSize:11}}>Day {b.day}</span>
            <span style={{color:"var(--t1)",fontWeight:600,fontSize:11}}>{fUSD(b.val)}</span>
          </div>
        ))}
        <div style={{marginTop:7,fontSize:10,color:"var(--a2)",padding:"5px 8px",background:"rgba(245,158,11,.05)",borderRadius:6}}>{result.disclaimer}</div>
      </div>
    )

    const skip = ["requires_confirmation","source","ts","warning","disclaimer","pools","tokens","recent_txns","breakpoints","top_pools","allocation","positions","instructions","mcp_action"]
    return (
      <div>
        {Object.entries(result||{}).filter(([k])=>!skip.includes(k)).slice(0,10).map(([k,v])=>(
          <div className="row" key={k}>
            <span style={{color:"var(--t3)",fontSize:11,textTransform:"capitalize",flexShrink:0}}>{k.replace(/_/g," ")}</span>
            <span style={{color:"var(--t1)",fontSize:11,fontWeight:600,textAlign:"right",maxWidth:"62%",wordBreak:"break-all"}}>
              {Array.isArray(v) ? (v as any[]).join(", ") : String(v)}
            </span>
          </div>
        ))}
        {result?.best && <div style={{marginTop:7,fontSize:11,color:"var(--g2)",padding:"5px 9px",background:"rgba(16,185,129,.05)",borderRadius:6}}>{result.best}</div>}
      </div>
    )
  }

  return (
    <div className="tool-card" style={{borderLeftColor:m.c}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:m.c,boxShadow:`0 0 6px ${m.c}`}}/>
        <span style={{fontFamily:"var(--dsp)",fontSize:9,fontWeight:700,color:m.c,letterSpacing:".16em",textTransform:"uppercase"}}>{m.l}</span>
        {result?.source && <span style={{fontSize:9,color:"var(--t3)",marginLeft:"auto"}}>📡 {result.source?.split(" ")[0]}</span>}
      </div>
      {body()}
      {result?.requires_confirmation && onConfirm && (
        <div style={{marginTop:10,padding:"9px 12px",background:"rgba(244,63,94,.06)",border:"1px solid rgba(244,63,94,.16)",borderRadius:8}}>
          <div style={{fontSize:10,color:"var(--r2)",marginBottom:7,fontFamily:"var(--dsp)",letterSpacing:".08em"}}>⚠ WALLET SIGNATURE REQUIRED</div>
          <button className="btn btn-g" onClick={()=>onConfirm(name,result)} style={{fontSize:10,padding:"6px 14px"}}>Confirm & Sign</button>
        </div>
      )}
    </div>
  )
}

function Bubble({msg,onConfirm}:{msg:any;onConfirm:(n:string,r:any)=>void}) {
  const isUser = msg.role==="user"
  return (
    <div className="msg-a" style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",gap:10,maxWidth:"100%"}}>
      {!isUser && <AgentAvatar size={34} glow/>}
      <div style={{maxWidth:isUser?"72%":"78%",minWidth:60,display:"flex",flexDirection:"column",gap:0}}>
        {!isUser && <div style={{fontFamily:"var(--dsp)",fontSize:8,color:"var(--p1)",letterSpacing:".22em",marginBottom:5,fontWeight:700}}>SAISEN AGENT</div>}
        <div style={{
          background: isUser ? "linear-gradient(135deg,rgba(124,58,237,.28),rgba(91,33,182,.16))" : "rgba(255,255,255,.035)",
          border: isUser ? "1px solid rgba(159,95,255,.28)" : "1px solid rgba(255,255,255,.07)",
          borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
          padding:"11px 14px", backdropFilter:"blur(8px)", wordBreak:"break-word",
        }}>
          {isUser
            ? <span style={{fontSize:14,color:"rgba(255,255,255,.87)",fontFamily:"var(--body)",fontWeight:500,lineHeight:1.6}}>{msg.content}</span>
            : <div className="md" style={{fontFamily:"var(--body)"}} dangerouslySetInnerHTML={{__html:renderMd(msg.content)}}/>
          }
        </div>
        {msg.toolResults?.map((tr:any,i:number)=>(
          <ToolCard key={i} name={tr.name} result={tr.result}
            onConfirm={tr.result?.requires_confirmation ? onConfirm : undefined}/>
        ))}
        <div style={{fontSize:9,color:"var(--t3)",marginTop:4,textAlign:isUser?"right":"left"}}>{msg.ts}</div>
      </div>
      {isUser && <UserAvatar size={34}/>}
    </div>
  )
}

function Typing({label}:{label?:string|null}) {
  return (
    <div className="msg-a" style={{display:"flex",gap:10,alignItems:"flex-end"}}>
      <AgentAvatar size={34}/>
      <div style={{background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"4px 18px 18px 18px",padding:"11px 16px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",gap:5}}>
          {[0,1,2].map(i=>(
            <div key={i} className="td" style={{width:6,height:6,borderRadius:"50%",background:"var(--p1)",animationDelay:`${i*.18}s`}}/>
          ))}
        </div>
        {label && <span style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--dsp)",letterSpacing:".07em"}}>{label}</span>}
      </div>
    </div>
  )
}

function WalletConnectPanel({onConnect}:{onConnect:()=>void}) {
  return (
    <div style={{background:"rgba(159,95,255,.05)",border:"1px solid var(--brd2)",borderRadius:"var(--r16)",padding:"24px 18px",textAlign:"center"}}>
      <div style={{width:54,height:54,borderRadius:"50%",overflow:"hidden",margin:"0 auto 14px",border:"2px solid rgba(159,95,255,.35)",boxShadow:"0 0 20px rgba(159,95,255,.25)"}}>
        <img src={LOGO} alt="SAISEN" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
      </div>
      <div style={{fontFamily:"var(--dsp)",fontSize:12,fontWeight:700,color:"var(--t1)",marginBottom:7,letterSpacing:".08em"}}>Connect Phantom Wallet</div>
      <div style={{fontSize:13,color:"var(--t3)",marginBottom:18,lineHeight:1.65}}>Connect to scan your live on-chain portfolio and execute transactions</div>
      <button className="btn btn-p" onClick={onConnect} style={{width:"100%",fontSize:11}}>Connect Wallet</button>
      <a href="https://phantom.app" target="_blank" rel="noreferrer"
        style={{display:"block",marginTop:10,fontSize:10,color:"var(--t3)",textDecoration:"none"}}>
        Don&apos;t have Phantom? Download →
      </a>
    </div>
  )
}

function WalletPanel({wallet,onConnect,onDisconnect,cache,loading,onAsk}:{wallet:any;onConnect:()=>void;onDisconnect:()=>void;cache:any;loading:boolean;onAsk:(m:string)=>void}) {
  if (!wallet.connected) return <WalletConnectPanel onConnect={onConnect}/>
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div className="card" style={{padding:"14px 16px",background:"linear-gradient(135deg,rgba(124,58,237,.08),rgba(59,130,246,.05))"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <AgentAvatar size={38}/>
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {wallet.address?.slice(0,12)}…{wallet.address?.slice(-5)}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3}}>
              <span style={{width:5,height:5,background:"var(--g1)",borderRadius:"50%",display:"inline-block"}}/>
              <span style={{fontSize:9,color:"var(--g2)",fontFamily:"var(--dsp)",letterSpacing:".1em"}}>MAINNET · PHANTOM</span>
            </div>
          </div>
          <button className="btn btn-gh" onClick={onDisconnect} style={{padding:"4px 8px",fontSize:10,flexShrink:0}}>✕</button>
        </div>
        {loading ? (
          <div style={{display:"flex",justifyContent:"center",padding:"12px 0"}}>
            <div className="sp" style={{width:18,height:18,border:"2px solid rgba(159,95,255,.25)",borderTopColor:"var(--p1)",borderRadius:"50%"}}/>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {([["SOL Balance",cache?.sol_balance?fAmt(cache.sol_balance,4)+" SOL":"—","var(--p2)"],["Portfolio",cache?.total_usd?fUSD(cache.total_usd):"—","var(--g3)"]] as [string,string,string][]).map(([l,v,c])=>(
              <div key={l} style={{background:"rgba(0,0,0,.35)",borderRadius:9,padding:"9px 11px"}}>
                <div style={{fontFamily:"var(--dsp)",fontSize:14,fontWeight:900,color:c,lineHeight:1}}>{v}</div>
                <div style={{fontSize:9,color:"var(--t3)",marginTop:3,letterSpacing:".08em"}}>{l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {cache?.tokens?.length > 0 && (
        <div>
          <div style={{fontFamily:"var(--dsp)",fontSize:9,color:"var(--t3)",letterSpacing:".2em",marginBottom:8}}>TOKENS</div>
          {cache.tokens.slice(0,8).map((t:any,i:number)=>(
            <div key={i} className="card card-h" style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",marginBottom:5}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`rgba(${i%3===0?"159,95,255":i%3===1?"59,130,246":"16,185,129"},.15)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"var(--dsp)",fontWeight:700,color:"var(--t2)",flexShrink:0}}>
                {t.symbol?.slice(0,2)||"??"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"var(--dsp)",fontSize:11,fontWeight:700,color:"var(--t1)"}}>{t.symbol}</div>
                <div style={{fontSize:10,color:"var(--t3)",marginTop:1}}>{fAmt(t.amount,4)}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>{fUSD(t.value_usd)}</div>
                <div style={{fontSize:10,color:"var(--t3)"}}>{t.alloc_pct}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!cache && !loading && (
        <button className="btn btn-gh" onClick={()=>onAsk("Scan my wallet and show full live portfolio")}
          style={{width:"100%",padding:"10px",fontSize:11,justifyContent:"center"}}>
          🔍 Scan Wallet
        </button>
      )}
    </div>
  )
}

function LogPanel({log}:{log:any[]}) {
  if (!log.length) return <div style={{textAlign:"center",padding:"44px 18px",fontSize:13,color:"var(--t3)"}}>No agent actions yet.</div>
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {log.map((h:any,i:number)=>(
        <div key={i} className="card" style={{padding:"9px 12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
            <div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,background:h.status==="success"?"var(--g1)":"var(--r1)",boxShadow:`0 0 5px ${h.status==="success"?"var(--g1)":"var(--r1)"}`}}/>
            <span style={{fontFamily:"var(--dsp)",fontSize:10,fontWeight:700,color:"var(--t2)",flex:1,letterSpacing:".06em"}}>{TMETA[h.tool]?.l||h.tool}</span>
            <span style={{fontSize:9,color:h.status==="success"?"var(--g2)":"var(--r2)",flexShrink:0}}>{h.status?.toUpperCase()}</span>
          </div>
          <div style={{fontSize:10,color:"var(--t3)"}}>{h.ts}</div>
        </div>
      ))}
    </div>
  )
}

function SettingsPanel({cfg,onChange}:{cfg:any;onChange:(v:any)=>void}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16,padding:"4px 0"}}>
      <div style={{fontFamily:"var(--dsp)",fontSize:11,fontWeight:700,color:"var(--p2)",letterSpacing:".1em",marginBottom:4}}>⚙ CONFIGURATION</div>
      {[
        {key:"rpc",       label:"Solana RPC Endpoint",ph:RPC_URL,     help:"Custom RPC (Helius, QuickNode) for better rate limits"},
        {key:"printrKey", label:"Printr API Key",      ph:"Your partner key…", help:"Required for MCP: token creation, reward distribution, on-chain staking"},
      ].map(f=>(
        <div key={f.key}>
          <div style={{fontFamily:"var(--dsp)",fontSize:9,color:"var(--t3)",letterSpacing:".16em",marginBottom:6}}>{f.label.toUpperCase()}</div>
          <input value={cfg[f.key]||""} onChange={e=>onChange({...cfg,[f.key]:e.target.value})}
            placeholder={f.ph} spellCheck={false}
            style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid var(--brd)",borderRadius:9,color:"var(--t1)",fontFamily:"var(--mono)",fontSize:11,padding:"9px 12px",outline:"none",transition:"border-color .2s"}}
            onFocus={e=>(e.target as HTMLInputElement).style.borderColor="var(--brd3)"}
            onBlur={e=>(e.target as HTMLInputElement).style.borderColor="var(--brd)"}
          />
          <div style={{fontSize:11,color:"var(--t3)",marginTop:5,lineHeight:1.5}}>{f.help}</div>
        </div>
      ))}
      <div style={{padding:"10px 12px",background:"rgba(59,130,246,.05)",border:"1px solid rgba(59,130,246,.14)",borderRadius:9,fontSize:11,color:"var(--b2)",lineHeight:1.65}}>
        ℹ Solana RPC, GeckoTerminal, and Jupiter are active without any key. Only Printr MCP requires configuration.
      </div>
    </div>
  )
}

function ConfirmModal({p,onOK,onCancel}:{p:any;onOK:()=>void;onCancel:()=>void}) {
  if (!p) return null
  const m = TMETA[p.name]||{l:p.name,c:"#9f5fff"}
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.82)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(10px)"}}>
      <div className="modal-a" style={{background:"linear-gradient(145deg,#0e0e24,#0a0a18)",border:"1px solid rgba(244,63,94,.28)",borderRadius:22,padding:28,maxWidth:420,width:"100%",boxShadow:"0 0 60px rgba(244,63,94,.1)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <AgentAvatar size={42}/>
          <div>
            <div style={{fontFamily:"var(--dsp)",fontSize:12,fontWeight:700,color:"var(--r2)",letterSpacing:".1em"}}>CONFIRM ACTION</div>
            <div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>{m.l} · Wallet signature required</div>
          </div>
        </div>
        <div style={{background:"rgba(0,0,0,.4)",borderRadius:10,padding:14,marginBottom:16,fontSize:13,lineHeight:1.7,color:"var(--t2)"}}>
          {p.name==="swap_executor" && (
            <div>Swap <strong style={{color:"var(--p2)"}}>{p.result.in_amount} {p.result.input_token}</strong>
              {" → "}<strong style={{color:"var(--g3)"}}>{p.result.out_amount} {p.result.output_token}</strong>
              <br/><span style={{fontSize:11,color:"var(--t3)"}}>Impact: {p.result.price_impact} · Route: {p.result.route}</span>
            </div>
          )}
          {p.name==="transfer_executor" && (
            <div>Transfer <strong style={{color:"var(--r2)"}}>{p.result.amount} {p.result.token}</strong> (~{fUSD(p.result.usd_value)})
              <br/><span style={{fontSize:11,color:"var(--t3)",wordBreak:"break-all"}}>To: {p.result.recipient?.slice(0,26)}…</span>
            </div>
          )}
          {!["swap_executor","transfer_executor"].includes(p.name) && (
            <pre style={{fontSize:11,color:"var(--t2)",whiteSpace:"pre-wrap",overflow:"auto",maxHeight:110}}>
              {JSON.stringify(p.result,null,2).slice(0,260)}
            </pre>
          )}
        </div>
        <div style={{padding:"9px 12px",background:"rgba(244,63,94,.05)",border:"1px solid rgba(244,63,94,.14)",borderRadius:8,marginBottom:18,fontSize:11,color:"rgba(244,63,94,.7)",lineHeight:1.5}}>
          ⚠ In a full deployment this broadcasts to Solana mainnet via Phantom. Irreversible.
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-g" onClick={onOK} style={{flex:1}}>✓ Confirm & Sign</button>
          <button className="btn btn-gh" onClick={onCancel} style={{flex:1}}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

const QA = [
  {l:"Scan Wallet",     m:"Scan my wallet and show my full live portfolio"},
  {l:"SOL Price",       m:"Get live SOL price and market data"},
  {l:"Compare Staking", m:"Compare all staking pools and live APRs"},
  {l:"Swap 1 SOL→USDC", m:"Get a Jupiter quote to swap 1 SOL to USDC"},
  {l:"Sim 90d Staking", m:"Simulate staking $500 in SOL for 90 days"},
  {l:"MCP Extensions",  m:"Show all available Printr MCP extensions"},
]

// ════════════════════════════════════════════════════════════
//  ROOT
// ════════════════════════════════════════════════════════════
export default function AgentApp() {
  const [msgs, setMsgs]      = useState<any[]>([{
    id:"init", role:"assistant", ts:tstmp(), toolResults:null,
    content:"**SAISEN Agent — Production.**\n\nLive connections: **Solana RPC** · **GeckoTerminal** · **Jupiter v6**\n\nConnect your **Phantom wallet** to scan live on-chain data. Configure Printr key in Settings for MCP actions.",
  }])
  const [input,    setInput]  = useState("")
  const [status,   setStatus] = useState<"idle"|"thinking"|"executing">("idle")
  const [actTool,  setActTool]= useState<string|null>(null)
  const [wallet,   setWallet] = useState({connected:false,address:""})
  const [wCache,   setWCache] = useState<any>(null)
  const [wLoading, setWLoad]  = useState(false)
  const [cfg,      setCfg]    = useState<any>(()=>st.g("cfg",{rpc:"",printrKey:""}))
  const [pending,  setPending]= useState<any>(null)
  const [sideTab,  setSideTab]= useState("wallet")
  const [sideOpen, setSideOpen]=useState(true)
  const [mobileView,setMobV]  = useState("chat")
  const [log,      setLog]    = useState<any[]>(()=>st.g("log",[]) as any[])

  const endRef = useRef<HTMLDivElement>(null)
  const inpRef = useRef<HTMLTextAreaElement>(null)
  const loading = status !== "idle"
  const rpcUrl  = cfg.rpc || RPC_URL

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}) },[msgs,status])

  const connectWallet = async () => {
    if (!window.solana?.isPhantom) { window.open("https://phantom.app/","_blank"); return }
    try {
      const r = await window.solana.connect()
      const addr = r.publicKey.toString()
      setWallet({connected:true,address:addr})
      setWLoad(true)
      try {
        const [sol, accs] = await Promise.all([api.solBalance(addr,rpcUrl), api.tokenAccs(addr,rpcUrl).catch(()=>[])])
        const mints = [SOL_MINT,...(accs as any[]).map((a:any)=>a.mint)]
        const px = await api.prices(mints).catch(()=>({})) as Record<string,string>
        const solPx = parseFloat(px[SOL_MINT]||"0")
        const tokens = [
          {mint:SOL_MINT,symbol:"SOL",name:"Solana",amount:sol,price_usd:solPx,value_usd:((sol as number)*solPx).toFixed(2),alloc_pct:"—"},
          ...(accs as any[]).map((a:any)=>{const m=TOKENS[a.mint]||{} as any;const p=parseFloat(px[a.mint]||"0");return{mint:a.mint,symbol:m.symbol||"???",name:m.name||a.mint.slice(0,8)+"…",amount:a.amount,price_usd:p,value_usd:(a.amount*p).toFixed(2),alloc_pct:"—"}}).filter((t:any)=>t.amount>0),
        ]
        const total = tokens.reduce((s:number,t:any)=>s+parseFloat(t.value_usd||"0"),0)
        const tok = tokens.map((t:any)=>({...t,alloc_pct:total>0?((parseFloat(t.value_usd||"0")/total)*100).toFixed(1):"0"}))
        setWCache({address:addr,sol_balance:(sol as number).toFixed(6),sol_price_usd:solPx,total_usd:total.toFixed(2),token_count:tokens.length,tokens:tok})
      } catch(e) { console.warn("Balance load:",e) }
      finally { setWLoad(false) }
    } catch(e:any) { if (e.code!==4001) console.error(e) }
  }

  const disconnectWallet = () => {
    window.solana?.disconnect?.()
    setWallet({connected:false,address:""})
    setWCache(null)
  }

  const send = useCallback(async (txt?: string) => {
    const t = (txt||input).trim()
    if (!t || loading) return
    setInput("")
    const um = {id:uid(),role:"user",content:t,ts:tstmp(),toolResults:null}
    setMsgs(prev=>[...prev,um])
    setStatus("thinking")
    const apiHist = [...msgs,um].map((x:any)=>({role:x.role,content:x.content}))
    const exec = makeExec(wallet.address, rpcUrl, cfg.printrKey, wCache, setWCache) as any
    const allTR: any[] = []
    try {
      let resp = await fetch("/api/agent/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1024,system:SYSTEM,tools:TOOLS,messages:apiHist}),
      })
      let data = await resp.json()
      while (data.stop_reason==="tool_use") {
        setStatus("executing")
        const tbs = data.content.filter((b:any)=>b.type==="tool_use")
        const trBlocks: any[] = []
        for (const tb of tbs) {
          setActTool(tb.name)
          let res: any
          try { res = await exec[tb.name]?.(tb.input) || {error:"Unknown tool"} }
          catch(e:any) { res = {error:e.message} }
          allTR.push({name:tb.name,input:tb.input,result:res})
          trBlocks.push({type:"tool_result",tool_use_id:tb.id,content:JSON.stringify(res)})
          const entry = {id:uid(),tool:tb.name,status:res.error?"failed":"success",ts:tstmp()}
          setLog(prev=>{ const n=[entry,...prev].slice(0,40); st.s("log",n); return n })
        }
        setStatus("thinking"); setActTool(null)
        resp = await fetch("/api/agent/chat", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1024,system:SYSTEM,tools:TOOLS,
            messages:[...apiHist,{role:"assistant",content:data.content},{role:"user",content:trBlocks}]}),
        })
        data = await resp.json()
      }
      const tb = data.content?.find((b:any)=>b.type==="text")
      setMsgs(prev=>[...prev,{id:uid(),role:"assistant",ts:tstmp(),content:tb?.text||"Done.",toolResults:allTR.length?allTR:null}])
    } catch(e:any) {
      setMsgs(prev=>[...prev,{id:uid(),role:"assistant",ts:tstmp(),content:`**Error:** ${e.message}\n\nCheck your connection and try again.`,toolResults:null}])
    } finally {
      setStatus("idle"); setActTool(null)
      setTimeout(()=>inpRef.current?.focus(), 80)
    }
  }, [msgs,input,loading,wallet,wCache,cfg,rpcUrl])

  const saveCfg = (v: any) => { setCfg(v); st.s("cfg",v) }
  const acceptPending = () => {
    setPending(null)
    setMsgs(prev=>[...prev,{id:uid(),role:"assistant",ts:tstmp(),
      content:"✓ **Confirmed.** In a full deployment, Phantom would now sign and broadcast to Solana mainnet.",toolResults:null}])
  }

  const scCfg: Record<string,{c:string;l:string}> = {
    idle:      {c:"var(--g1)",l:"READY"},
    thinking:  {c:"var(--p1)",l:"THINKING"},
    executing: {c:"var(--a1)",l:"EXECUTING"},
  }
  const sc = scCfg[status]||scCfg.idle

  const apiStatus = [
    {n:"Solana RPC",   c:"var(--g2)", s:"LIVE"},
    {n:"GeckoTerminal",c:"var(--g2)", s:"LIVE"},
    {n:"Jupiter v6",   c:"var(--g2)", s:"LIVE"},
    {n:"Printr MCP",   c:cfg.printrKey?"var(--g2)":"var(--a2)", s:cfg.printrKey?"ACTIVE":"NO KEY"},
  ]

  const renderSideBody = () => {
    if (sideTab==="wallet")   return <WalletPanel wallet={wallet} onConnect={connectWallet} onDisconnect={disconnectWallet} cache={wCache} loading={wLoading} onAsk={m=>{send(m);if(typeof window!=="undefined"&&window.innerWidth<768)setMobV("chat")}}/>
    if (sideTab==="log")      return <LogPanel log={log}/>
    if (sideTab==="settings") return <SettingsPanel cfg={cfg} onChange={saveCfg}/>
    return null
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app-bg" aria-hidden>
        <div className="app-bg-grid"/>
        <div className="app-bg-glow"/>
        <div className="app-bg-scan"/>
      </div>
      <ConfirmModal p={pending} onOK={acceptPending} onCancel={()=>setPending(null)}/>

      <div className={`app ${sideOpen?"side-open":"side-closed"}`}>
        {/* HEADER */}
        <header className="app-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",height:"var(--hdr)",background:"rgba(6,6,15,.97)",borderBottom:"1px solid var(--brd)",backdropFilter:"blur(28px)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
            <AgentAvatar size={36} glow/>
            <div style={{minWidth:0}}>
              <div className="fl" style={{fontFamily:"var(--dsp)",fontSize:16,fontWeight:900,letterSpacing:".2em",color:"#fff",lineHeight:1}}>SAISEN</div>
              <div style={{fontSize:8,color:"var(--t3)",letterSpacing:".18em",marginTop:2,fontFamily:"var(--dsp)"}}>WEB3 EXECUTION AGENT</div>
            </div>
            <div style={{marginLeft:6,display:"flex",alignItems:"center",gap:5,padding:"4px 9px",background:"rgba(255,255,255,.03)",border:"1px solid var(--brd)",borderRadius:999}}>
              <div className="status-dot" style={{background:sc.c,boxShadow:`0 0 6px ${sc.c}`,animation:status!=="idle"?"spin .8s linear infinite":"none"}}/>
              <span style={{fontFamily:"var(--dsp)",fontSize:8,color:sc.c,letterSpacing:".18em"}}>{sc.l}</span>
              {actTool && <span style={{fontSize:8,color:"var(--t3)",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>· {actTool}</span>}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
            <span style={{background:"rgba(16,185,129,.1)",border:"1px solid rgba(16,185,129,.22)",color:"var(--g2)",borderRadius:5,padding:"3px 8px",fontSize:8,fontFamily:"var(--dsp)",letterSpacing:".1em"}}>MAINNET</span>
            {cfg.printrKey && <span style={{background:"rgba(6,182,212,.1)",border:"1px solid rgba(6,182,212,.22)",color:"var(--c2)",borderRadius:5,padding:"3px 8px",fontSize:8,fontFamily:"var(--dsp)",letterSpacing:".1em"}}>MCP ✓</span>}
            <Link href="/" style={{color:"rgba(255,255,255,.45)",fontSize:11,fontFamily:"var(--dsp)",textDecoration:"none",letterSpacing:".06em",padding:"5px 11px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,transition:"all .2s"}}>← Game</Link>
            <button className="btn btn-gh desktop-toggle" onClick={()=>setSideOpen(v=>!v)} style={{padding:"5px 11px",fontSize:10}}>
              {sideOpen?"◀ Hide":"▶ Panel"}
            </button>
          </div>
        </header>

        {/* CHAT AREA */}
        <div className="chat-area" style={{display:mobileView==="chat"?"flex":undefined,flexDirection:"column",minHeight:0,overflow:"hidden"}}>
          {mobileView!=="chat" ? (
            <div className="sc" style={{flex:1,overflowY:"auto",padding:"16px 14px"}}>
              {mobileView==="wallet"   && <WalletPanel wallet={wallet} onConnect={connectWallet} onDisconnect={disconnectWallet} cache={wCache} loading={wLoading} onAsk={m=>{send(m);setMobV("chat")}}/>}
              {mobileView==="log"      && <LogPanel log={log}/>}
              {mobileView==="settings" && <SettingsPanel cfg={cfg} onChange={saveCfg}/>}
            </div>
          ) : (
            <>
              <div className="sc" style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:"rgba(16,185,129,.05)",border:"1px solid rgba(16,185,129,.15)",borderRadius:10,flexWrap:"wrap"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:"var(--g1)",flexShrink:0}}/>
                  <span style={{color:"var(--g2)",fontFamily:"var(--dsp)",fontSize:9,letterSpacing:".1em",flexShrink:0}}>LIVE:</span>
                  <span style={{color:"var(--t2)",fontSize:12}}>Solana RPC · GeckoTerminal · Jupiter v6{cfg.printrKey?" · Printr MCP":""}</span>
                </div>
                {msgs.map((m:any)=>(
                  <Bubble key={m.id} msg={m} onConfirm={(n,r)=>setPending({name:n,result:r})}/>
                ))}
                {loading && <Typing label={actTool?`calling ${actTool}…`:status==="thinking"?"thinking…":null}/>}
                <div ref={endRef}/>
              </div>
              <div style={{padding:"8px 16px 0",borderTop:"1px solid rgba(255,255,255,.04)",background:"rgba(6,6,15,.6)",backdropFilter:"blur(10px)"}}>
                <div className="sc" style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:8}}>
                  {QA.map(q=>(
                    <button key={q.l} className="qa-pill" onClick={()=>send(q.m)} disabled={loading}>{q.l}</button>
                  ))}
                </div>
              </div>
              <div style={{padding:"8px 16px 12px",display:"flex",gap:9,alignItems:"flex-end",background:"rgba(6,6,15,.94)",backdropFilter:"blur(20px)"}}>
                <textarea ref={inpRef} className="chat-inp"
                  placeholder="Ask SAISEN — wallet scan, prices, swap, staking…"
                  value={input} disabled={loading}
                  onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()} }}
                  rows={1}
                  onInput={e=>{ const el=e.target as HTMLTextAreaElement; el.style.height="auto"; el.style.height=Math.min(el.scrollHeight,120)+"px" }}
                />
                <button className="send-btn" onClick={()=>send()} disabled={loading||!input.trim()}>
                  {loading
                    ? <div className="sp" style={{width:16,height:16,border:"2px solid rgba(255,255,255,.25)",borderTopColor:"#fff",borderRadius:"50%"}}/>
                    : <span>↑</span>
                  }
                </button>
              </div>
            </>
          )}
        </div>

        {/* SIDE PANEL */}
        {sideOpen && (
          <aside className="side-panel panel-a" style={{borderLeft:"1px solid var(--brd)",background:"rgba(0,0,0,.33)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{display:"flex",borderBottom:"1px solid var(--brd)",flexShrink:0}}>
              {(([["wallet","WALLET"],["log","LOG"],["settings","⚙"]] as [string,string][])).map(([id,l])=>(
                <button key={id} className={`tab-btn${sideTab===id?" active":""}`} onClick={()=>setSideTab(id)}>{l}</button>
              ))}
            </div>
            <div className="sc" style={{flex:1,overflowY:"auto",padding:"14px 12px"}}>
              {renderSideBody()}
            </div>
            <div style={{padding:"8px 12px",borderTop:"1px solid var(--brd)",background:"rgba(0,0,0,.22)",flexShrink:0}}>
              {apiStatus.map(a=>(
                <div key={a.n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 0"}}>
                  <span style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--dsp)",letterSpacing:".08em"}}>{a.n}</span>
                  <span style={{fontSize:9,color:a.c,fontFamily:"var(--dsp)",fontWeight:700,letterSpacing:".08em"}}>{a.s}</span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* MOBILE BOTTOM NAV */}
        <nav className="bottom-nav" style={{borderTop:"1px solid var(--brd)",background:"rgba(6,6,15,.98)",backdropFilter:"blur(24px)",zIndex:100,alignItems:"stretch",height:"var(--bnav)",display:"flex"}}>
          {[
            {id:"chat",    icon:<div style={{width:22,height:22,borderRadius:"50%",overflow:"hidden",border:"1px solid rgba(159,95,255,.35)"}}><img src={LOGO} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>, l:"Agent"},
            {id:"wallet",  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><circle cx="12" cy="14" r="2"/></svg>, l:"Wallet"},
            {id:"log",     icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, l:"Log"},
            {id:"settings",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, l:"Settings"},
          ].map(item=>(
            <button key={item.id} onClick={()=>setMobV(item.id)}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,background:"none",border:"none",cursor:"pointer",padding:"6px 0",
                color:mobileView===item.id?"var(--p2)":"var(--t3)",transition:"color .18s",
                fontFamily:"var(--dsp)",fontSize:8,letterSpacing:".1em",
                borderTop:mobileView===item.id?"2px solid var(--p1)":"2px solid transparent"}}>
              {item.icon}
              {item.l}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}
