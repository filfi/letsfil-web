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

  interface Plan {
    actual_amount: string;
    begin_seal_time: number;
    delay_seal_time: number;
    end_seal_time: number;
    factory_contract: string;
    income_rate: number;
    investor_share: number;
    latest_block_number: number;
    min_raise_rate: string;
    miner_id: string;
    ops_security_fund: string;
    ops_security_fund_address: string;
    power_progress: number;
    progress: number;
    raise_address: string;
    raise_create_time: number;
    raiser: string;
    raiser_share: number;
    raising_id: string;
    seal_time_limit: number;
    sealed_status: number;
    sector_period: number;
    sector_size: number;
    security_fund: string;
    service_id: number;
    service_provider_address: string;
    servicer_share: number;
    sponsor_company: string;
    status: number;
    target_amount: string;
    target_power: string;
    tx_hash: string;
  }
}
