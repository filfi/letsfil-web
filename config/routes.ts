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
    name: 'account',
    path: '/account',
    component: './account/layout',
    routes: [
      {
        name: 'assets',
        path: 'assets',
        component: './account/Assets',
      },
      {
        name: 'plans',
        path: 'plans',
        component: './account/Plans',
      },
      {
        name: 'stats',
        path: 'stats',
        component: './account/Stats',
      },
      { path: '/account', redirect: '/account/plans' },
    ],
  },
  {
    name: 'stake',
    path: 'stake',
    component: './Stake',
  },
  {
    name: 'lending',
    path: 'lending',
    component: './lending/layout',
    routes: [
      {
        name: 'lendingLoan',
        path: 'loan',
        component: './lending/Loan',
      },
      {
        name: 'lendingSelect',
        path: 'select',
        component: './lending/Select',
      },
      {
        name: 'select',
        path: 'select',
        component: './lending/Select',
      },
      {
        name: 'lendingResult',
        path: 'result',
        component: './lending/Result',
      },
      { path: '/lending', redirect: '/lending/loan' },
    ],
  },
  {
    name: 'raising',
    path: 'raising',
    component: './Raising',
  },
  {
    name: 'create',
    path: 'create',
    component: './create/layout',
    routes: [
      {
        name: 'storage',
        path: 'storage',
        component: './create/Storage',
      },
      {
        name: 'program',
        path: 'program',
        component: './create/Program',
      },
      {
        name: 'benefit',
        path: 'benefit',
        component: './create/Benefit',
      },
      {
        name: 'createResult',
        path: 'result/:id',
        component: './create/Result',
      },
      { path: '/create', redirect: '/create/storage' },
    ],
  },
  {
    name: 'mount',
    path: 'mount',
    component: './mount/layout',
    routes: [
      {
        name: 'storage',
        path: 'storage',
        component: './mount/Storage',
      },
      {
        name: 'benefit',
        path: 'benefit',
        component: './mount/Benefit',
      },
      {
        name: 'mountResult',
        path: 'result/:id',
        component: './mount/Result',
      },
      { path: '/mount', redirect: '/mount/storage' },
    ],
  },
  {
    name: 'overview',
    path: 'overview/:id',
    component: './Overview',
  },
  {
    name: 'assets',
    path: 'assets',
    component: './assets/layout',
    routes: [
      {
        name: 'assetsOverview',
        path: 'overview/:id',
        component: './assets/Overview',
      },
      {
        name: 'assetsLeverage',
        path: 'leverage/:id',
        component: './assets/Leverage',
      },
      { path: '/assets', redirect: '/' },
    ],
  },
  {
    name: 'fspa',
    path: 'fspa',
    component: './fspa/layout',
    routes: [
      {
        path: 'list',
        name: 'FSPAList',
        component: './fspa/List',
      },
      {
        path: 'overview/:address',
        name: 'FSPAOverview',
        component: './fspa/Overview',
      },
      { path: '/fspa', redirect: '/fspa/list' },
    ],
  },
  // other 404
  { path: '*', redirect: '/' },
];

export default routes;
