import React, {useEffect} from 'react';
import {useTodoLists} from 'store/TodoListProvider';

const POLL_TIME = 5000; //two second poll time

/**
 * I am not really happy with this method, but due to time constraints I have decided to use a poller
 * instead of setting up a subscription model with WebSockets, RPC or something similar.
 */
export const Synchronizer = () => {
  const {synchronizeData} = useTodoLists();

  useEffect(() => {
    const interval = setInterval(async () => {
      await synchronizeData();
    }, POLL_TIME);
    return () => clearInterval(interval);
  }, [synchronizeData]);

  return null;
};
