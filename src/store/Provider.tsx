import * as React from "react";
// import Props from "redux-zero/interfaces/Props";
import propValidation from "redux-zero/utils/propsValidation";
import Store from "redux-zero/interfaces/Store";
import ReactReduxContext from "redux-zero/react/components/Context";


// import Store from "./Store";
interface Props<S = any> {
    store: Store<S>;
    context: Object;
    children: JSX.Element[] | JSX.Element;
}


export default class Provider<S = any> extends React.Component<Props<S>> {
    static childContextTypes = {
      store: propValidation
    };
    getChildContext() {
      const { store } = this.props;
      return { store };
    }
    render() {
      const { store, context, children } = this.props;
      const Context = context || ReactReduxContext
      return <Context.Provider value={store}>{children}</Context.Provider>;
    }
  }

// export default class Provider<S = any> extends React.Component<Props<S>> {
//     static childContextTypes: {
//         store: typeof propValidation;
//     };
//     //@ts-ignore
//     getChildContext(): {
//         store: Store<S>;
//     };
//     //@ts-ignore
//     render(): JSX.Element;
// }
