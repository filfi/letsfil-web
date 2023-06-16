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
      { path: '/account', redirect: '/account/assets' },
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
        name: 'result',
        path: 'result/:id',
        component: './create/Result',
      },
      { path: '/create', redirect: '/create/storage' },
    ],
  },
  {
    name: 'overview',
    path: 'overview/:id',
    component: './Overview',
  },
  {
    name: 'assets',
    path: 'assets/:id',
    component: './Assets',
  },
  // other 404
  { path: '*', redirect: '/' },
];

export default routes;
