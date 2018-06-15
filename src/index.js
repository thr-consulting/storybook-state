import React from 'react';
import T from 'prop-types';
import addons, {makeDecorator} from '@storybook/addons';

export class Store {
  constructor(initialState) {
    this.initialState = Object.freeze({ ...initialState });
    this.state = this.initialState;
    this.handlers = [];
  }

  set(state) {
    this.state = Object.freeze({ ...this.state, ...state });
    this.fireStateChange();
  }

  reset() {
    if (this.initialState !== this.state) {
      this.state = this.initialState;
      this.fireStateChange();
    }
  }

  subscribe(handler) {
    if (this.handlers.indexOf(handler) < 0) {
      this.handlers.push(handler);
    }
  }

  unsubscribe(handler) {
    const handlerIndex = this.handlers.indexOf(handler);
    if (handlerIndex >= 0) {
      this.handlers.splice(handlerIndex, 1);
    }
  }

  fireStateChange() {
    const state = this.state;

    this.handlers.forEach(handler => handler(state));
  }
}

export class StoryState extends React.Component {
	static propTypes = {
		channel: T.object.isRequired,
		parameters: T.object.isRequired,
		story: T.func.isRequired,
		context: T.object,
	};

	componentDidMount() {
		const {parameters: {store}, channel} = this.props;

		store.subscribe(this.handleStateChange);
		channel.on('dump247/state/reset', this.handleResetEvent);
		channel.emit('dump247/state/change', {state: store.state});
	}

	componentWillUnmount() {
		const {parameters: {store}, channel} = this.props;

		store.unsubscribe(this.handleStateChange);
		channel.removeListener('dump247/state/reset', this.handleResetEvent);
		channel.emit('dump247/state/change', {state: null});
	}

	handleResetEvent = () => {
		const {parameters: {store}} = this.props;

		store.reset();
	};

	handleStateChange = storyState => {
		const {channel} = this.props;

		this.forceUpdate();
		channel.emit('dump247/state/change', {state: storyState});
	};

	render() {
		const {story, context} = this.props;

		const child = story(context);
		return React.isValidElement(child) ? child : child();
	}
}

export const withState = makeDecorator({
	name: 'withState',
	parameterName: 'state',
	skipIfNoParametersOrOptions: true,
	wrapper: (getStory, context, {parameters}) => {
		const channel = addons.getChannel();
		return <StoryState story={getStory} channel={channel} context={context} parameters={parameters}/>;
	},
});
