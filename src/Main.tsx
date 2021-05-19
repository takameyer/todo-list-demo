import React from 'react';
import {TodoListProvider} from 'store/TodoListProvider';
import {App} from 'App';
import {SelectedListProvider} from 'store/SelectedListProvider';

export const Main = () => {
  return (
    <TodoListProvider>
      <SelectedListProvider>
        <App />
      </SelectedListProvider>
    </TodoListProvider>
  );
};

export default Main;
