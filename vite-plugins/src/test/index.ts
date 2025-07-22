export function testPlugin() {
  return {
    name: 'test-plugin',
    buildStart() {
      // eslint-disable-next-line no-console
      console.log('buildStart')
    },
  }
}
