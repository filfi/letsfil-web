declare namespace API {
  type Base = Record<string, any>;

  type PagingParams = {
    page?: number;
    page_size?: number;
  };

  type Res<T = any> = {
    code: number;
    data: T;
    msg: string;
  };

  type PagingRes<T = any> = {
    total: number;
    list: T[];
  };

  type User = {
    ID: number;
    CreatedAt: string;
    address: string;
    name: string;
    url: string;
  };

  type Provider = {
    full_name: string;
    id: number;
    introduction: string;
    logo_url: string;
    short_name: string;
    wallet_address: string;
  };

  interface Plan {
    actual_amount: string;
    begin_seal_time: number;
    begin_time: number;
    closing_time: number;
    delay_seal_time: number;
    end_seal_time: number;
    factory_contract: string;
    ffi_protocol_fee: string;
    ffi_protocol_fee_pay_meth: number;
    his_blance: string;
    his_initial_pledge: string;
    his_power: string;
    his_sector_count: number;
    income_rate: number;
    latest_block_number: number;
    min_raise_rate: number;
    miner_id: string;
    miner_type: number;
    op_server_share: number;
    ops_security_fund: string;
    ops_security_fund_addr: string;
    ops_security_fund_rate: number;
    plan_open: number;
    power_progress: number;
    progress: number;
    raise_address: string;
    raise_create_time: number;
    raise_days: 2592000;
    raise_his_asset_rate: number;
    raise_his_initial_pledge_rate: number;
    raise_his_power_rate: number;
    raise_margin_status: number;
    raise_security_fund: string;
    raiser: string;
    raiser_coin_share: number;
    raising_id: string;
    raising_name: string;
    seal_days: number;
    sealed_status: number;
    sector_period: number;
    sector_size: number;
    service_id: number;
    service_provider_address: string;
    sp_margin_status: number;
    sp_sign_status: number;
    sponsor_company: string;
    sponsor_logo: string;
    status: number;
    target_amount: string;
    target_power: string;
    tx_hash: string;
  }

  type MinerAsset = {
    active_sector_count: number;
    available_balance: string;
    balance: string;
    faulty_sector_count: number;
    fee_debt: string;
    initial_pledge: string;
    live_sector_count: number;
    locked_funds: string;
    miner_id: string;
    miner_power: string;
    pre_commit_deposits: string;
    sector_count: number;
    sector_size: number;
    total_balance: string;
  };

  type Event = {
    CreatedAt: string;
    DeletedAt: string;
    ID: number;
    UpdatedAt: string;
    asset_pack_id: number;
    contract_address: string;
    event_sign: string;
    height: number;
    pyload: string;
    tx: string;
  };
}
