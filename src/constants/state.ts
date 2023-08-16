/**
 * 节点计划状态
 */
export enum RaiseState {
  /**
   * 等待开始
   */
  WaitingStart = 0,

  /**
   * 质押中
   */
  Raising = 1,

  /**
   * 质押关闭
   */
  Closed = 2,

  /**
   * 质押成功
   */
  Success = 3,

  /**
   * 质押失败
   */
  Failure = 4,

  /**
   * 准备中
   */
  Pending = 10,
}

/**
 * 分配计划状态
 */
export enum AssignState {
  /**
   * 未开始
   */
  Inactive = 0,

  /**
   * 进行中
   */
  Active = 1,

  /**
   * 已完成
   */
  Done = 2,

  /**
   * 已结束
   */
  Over = 9,
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
}
