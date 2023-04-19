export type IBestAFSRoute = {
  path?: string;
  name?: string;
  icon?: string;
  component?: string;
  redirect?: string;
  title?: string;
  wrappers?: string[];
  routes?: IBestAFSRoute[];
  // 更多功能查看
  // https://beta-pro.ant.design/docs/advanced-menu
  // ---
  // 新页面打开
  target?: string;
  // 不展示顶栏
  headerRender?: false;
  // 不展示页脚
  footerRender?: false;
  // 不展示菜单
  menuRender?: false;
  // 不展示菜单顶栏
  menuHeaderRender?: false;
  // 权限配置，需要与 plugin-access 插件配合使用
  access?: string;
  // 隐藏子菜单
  hideChildrenInMenu?: true;
  // 隐藏自己和子菜单
  hideInMenu?: true;
  // 在面包屑中隐藏
  hideInBreadcrumb?: true;
  // 子项往上提，仍旧展示,
  flatMenu?: true;
};

const routes: IBestAFSRoute[] = [
  {
    path: '/',
    name: 'home',
    component: './Home',
  },
  {
    name: 'lending',
    path: '/lending',
    component: './Lending',
  },
  {
    name: 'account',
    path: '/account',
    component: './Account',
  },
  {
    name: 'letsfil',
    path: '/letsfil',
    component: './letsfil/layout',
    routes: [
      {
        name: 'raising',
        path: 'raising',
        component: './letsfil/Raising',
      },
      {
        name: 'create',
        path: 'create',
        component: './letsfil/create/layout',
        routes: [
          {
            name: 'program',
            path: 'program',
            component: './letsfil/create/Program',
          },
          {
            name: 'allocation',
            path: 'allocation',
            component: './letsfil/create/Allocation',
          },
          {
            name: 'build',
            path: 'build',
            component: './letsfil/create/Build',
          },
          {
            name: 'confirm',
            path: 'confirm',
            component: './letsfil/create/Confirm',
          },
          {
            name: 'payment',
            path: 'payment',
            component: './letsfil/create/Payment',
          },
          { path: '/letsfil/create', redirect: '/letsfil/create/program' },
        ],
      },
      {
        name: 'payfor',
        path: 'payfor',
        component: './letsfil/payfor/layout',
        routes: [
          {
            name: 'payforOverview',
            path: 'overview/:id',
            component: './letsfil/payfor/Overview',
          },
        ],
      },
      {
        name: 'confirm',
        path: 'confirm',
        component: './letsfil/confirm/layout',
        routes: [
          {
            name: 'confirmOverview',
            path: 'overview/:id',
            component: './letsfil/confirm/Overview',
          },
        ],
      },
      {
        name: 'overview',
        path: 'overview/:id',
        component: './letsfil/Overview',
      },
      {
        name: 'staking',
        path: 'staking/:id',
        component: './letsfil/Staking',
      },
      { path: '/letsfil', redirect: '/letsfil/raising' },
    ],
  },
];

export default routes;
