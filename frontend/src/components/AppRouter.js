import React, { Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authRoutes, publicRoutes } from '../Routes';
import { SHOP_ROUTE } from '../utils/consts';
import { Context } from '../index';

export class AppRouter extends Component {
  render() {
    return (
      <Context.Consumer>
        {({ user }) => {
          return (
            <Routes>
              {user.isAuth && authRoutes.map(({ path, component: Component }) => 
                <Route key={path} path={path} element={<Component />} exact />
              )}
              {publicRoutes.map(({ path, component: Component }) => 
                <Route key={path} path={path} element={<Component />} exact />
              )}
              <Route path="*" element={<Navigate to={SHOP_ROUTE || "/"} replace />} />
            </Routes>
          );
        }}
      </Context.Consumer>
    );
  }
}

export default AppRouter;