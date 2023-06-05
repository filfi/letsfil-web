/**
 * 募集计划状态
 */
export enum RaiseState {
  /**
   * 等待开始
   */
  WaitingStart = 0,
  /**
   * 募集中
   */
  Raising = 1,
  /**
   * 募集关闭
   */
  Closed = 2,
  /**
   * 募集成功
   */
  Success = 3,
  /**
   * 募集失败
   */
  Failure = 4,
  /**
   * 准备中
   */
  Pending = 10,
}

/**
 * 节点状态
 */
export enum NodeState {
  /**
   * 等待封装
   */
  WaitingStart = 0,
  /**
   * 封装已经开始
   */
  Started = 1,
  /**
   * 封装展期
   */
  Delayed = 2,
  /**
   * 封装结束
   */
  End = 3,
  /**
   * 已经销毁
   */
  Destroy = 4,
  /**
   * 预封装
   */
  PreSeal = 11,
}
