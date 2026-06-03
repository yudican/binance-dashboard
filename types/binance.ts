export interface AccountInfo {
  feeTier: number
  feeBurn: boolean
  canTrade: boolean
  canDeposit: boolean
  canWithdraw: boolean
  multiAssetsMargin: boolean
  totalWalletBalance: string
  totalUnrealizedProfit: string
  totalMarginBalance: string
  totalInitialMargin: string
  totalMaintMargin: string
  totalPositionInitialMargin: string
  totalOpenOrderInitialMargin: string
  availableBalance: string
  maxWithdrawAmount: string
  totalCrossWalletBalance: string
}

export interface Position {
  symbol: string
  positionAmt: string
  entryPrice: string
  markPrice: string
  unRealizedProfit: string
  liquidationPrice: string
  leverage: string
  isolatedMargin: string
  positionSide: 'BOTH' | 'LONG' | 'SHORT'
  updateTime: number
}

export interface Order {
  orderId: number
  symbol: string
  status: string
  side: 'BUY' | 'SELL'
  type: string
  price: string
  origQty: string
  executedQty: string
  stopPrice: string
  time: number
  updateTime: number
}

export type IncomeType =
  | 'REALIZED_PNL'
  | 'FUNDING_FEE'
  | 'COMMISSION'
  | 'TRANSFER'
  | 'WELCOME_BONUS'
  | 'INSURANCE_CLEAR'
  | 'REFERRAL_KICKBACK'
  | string

export interface IncomeRecord {
  symbol: string
  incomeType: IncomeType
  income: string
  asset: string
  info: string
  time: number
  tranId: string
  tradeId: string
}

export interface CommissionRate {
  symbol: string
  makerCommissionRate: string
  takerCommissionRate: string
}

export interface BinanceData {
  account: AccountInfo | null
  positions: Position[]
  openOrders: Order[]
  pnlIncome: IncomeRecord[]
  fundingIncome: IncomeRecord[]
  commissionIncome: IncomeRecord[]
  allIncome: IncomeRecord[]
  commissionRate: CommissionRate | null
}
