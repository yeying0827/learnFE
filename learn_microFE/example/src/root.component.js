singleSpa.registerApplication(
  '@yy/example',
  () => System.import('@yy/example1'),
  location => location.pathname.startsWith('/')
);
