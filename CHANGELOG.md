# 1.5.0-thx.1

2018-June-15

#### Breaking Changes

-   updated to use addon parameters. You need to pass a new store as a parameter.

```js
storiesOf('MyStory', module)
  .addDecorator(withState)
  .add(
  	'my default story',
  	MyStoryFn,
  	{
  		state: {store: new Store(initialState)},
  	},
  )
```
