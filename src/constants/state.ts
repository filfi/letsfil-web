/**
 * 募集计划状态
 */
export enum RaiseState {
  NotStarted, // 未开始
  WaitPayOPSSecurityFund, // 等待缴纳运维保证金
  WaitSeverSign, // 等待服务商签名
  InProgress, // 募集进行中
  Closed, // 募集关闭
  Successed, // 募集成功
  Failed, // 募集失败
}

/**
 * 节点状态
 */
export enum NodeState {
  WaitingStart, // 未开始
  Started, // 已开始
  Delayed, // 已延迟
  End, // 已结束
  Success, // 成功
  Failure, // 失败
  Destroy, // 已销毁
}
