import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';import { persistReducer } from 'redux-persist';
import localStorage from 'redux-persist/lib/storage';
import Grid from '@material-ui/core/Grid';
import { pkgName } from './constants/appConstants';

const useStyles = makeStyles({
  text: {
    fontSize: "14px"
  }
});

const Component = ({
  i18n,
  test,
  testAction,
  language,
  __instanceId,
  __baseUrl,
}) => {
  const t = i18n
    ? (key) => {
      const tr = i18n(key);
      return tr || key;
    }
    : (key) => key;

  const classes = useStyles();

  if (!language) return null;
  return (
    <Grid xs={12} container spacing={3} alignItems="center" justify="space-between">
      <Grid xs={12} item direction="column" container alignItems="center" spacing={1}>
      {t("hello_world")}
      /
      {test}
      /
      {__instanceId}
      /
      {__baseUrl}
      </Grid>
    </Grid>
  );
};

const mapStateToProps = (state) => {
  return {
    test: state[pkgName].test,
    language: state.language.language,
  };
};

const mapDispatchToProps = (dispatch) => ({
  testAction: (payload) =>
    dispatch({
      type: `@${pkgName}/TEST_ACTION`,
      payload,
    })
});

const exported = connect(mapStateToProps, mapDispatchToProps)(Component);

exported.reducer = (
  state = {
    test: null
  },
  action
) => {
  const { type, payload } = action;

  switch (type) {
    case `@${pkgName}/TEST_ACTION`:
      return {
        ...state,
        test: payload,
      };
    default:
      return state;
  }
};const persistConfig = {
  key: `${pkgName}`,
  storage: localStorage,
  version: 0,
  whitelist: ['test']
};

exported.reducer = persistReducer(persistConfig, exported.reducer);


exported.sagas = [];

const logger = (store) => (next) => (action) => {
  console.log('dispatching', action);
  let result = next(action);
  console.log('next state', store.getState());
  return result;
};

exported.middlewares = [logger];

export default exported;