import React from 'react';
import {SafeAreaView} from 'react-native';
import {TodoList} from 'components/TodoList';
import {Header} from 'components/Header';
import {Footer} from 'components/Footer';
import {Synchronizer} from 'components/Synchronizer';

export const App = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#ededed'}}>
      <Header />
      <TodoList />
      <Footer />
      <Synchronizer />
    </SafeAreaView>
  );
};
