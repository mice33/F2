import { jsx } from '../../../src';
import { createContext, delay } from '../../util';
import { Canvas, Component } from '../../../src';
const context = createContext();

const onFrame = jest.fn();
const onEnd = jest.fn();

class Test extends Component {
  render() {
    return (
      <rect
        attrs={{
          x: 10,
          y: 10,
          width: 0,
          height: 10,
          fill: 'red',
        }}
        animation={{
          appear: {
            easing: 'linear',
            duration: 100,
            property: ['width'],
            start: {
              width: 10,
            },
            end: {
              width: 100,
            },
            onFrame,
            onEnd,
          },
        }}
      />
    );
  }
}

describe('Canvas', () => {
  it('测试动画', async (done) => {
    const { props } = (
      <Canvas context={context} pixelRatio={1}>
        <Test />
      </Canvas>
    );

    const canvas = new Canvas(props);
    const testComponent = canvas.children;
    await delay(100);
    canvas.render();
    await delay(0);
    const rect = canvas.children.component.container.getChildren()[0];

    expect(rect.getAttribute('width')).toBe(10);

    // 动画结束后
    setTimeout(() => {
      expect(rect.getAttribute('width')).toBe(100);
      expect(onFrame.mock.calls.length > 1).toBe(true);
      expect(onEnd.mock.calls.length).toBe(1);
      done();
    }, 1000);
  });
});
