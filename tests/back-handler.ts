import { BackHandler } from 'react-native';

export function mockBackHandler() {
  const state = { handler: null as null | ((event: any) => boolean | null | undefined), remove: jest.fn() };
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    state.handler = handler;
    return { remove: state.remove };
  });
  return { press: () => state.handler?.({}) ?? false, remove: state.remove };
}
