import { jsx, Component, ComponentType } from '@antv/f-engine';
import { isString, isNil, isFunction } from '@antv/util';
import Chart, { ChartChildProps, Point } from '../../chart';
import { computeLayout, AnimationProps } from '@antv/f-engine';

export interface GuideProps {
  records: any;
  onClick?: (ev) => void;
  animation?: ((points: Point[], chart: Chart) => AnimationProps) | AnimationProps;
  [key: string]: any;
}

export default function<IProps extends GuideProps = GuideProps>(
  View: ComponentType<IProps & ChartChildProps>
): ComponentType<IProps & ChartChildProps> {
  return class Guide extends Component<IProps & ChartChildProps> {
    chart: Chart;

    constructor(props: IProps & ChartChildProps) {
      super(props);
    }

    getGuideBBox() {
      const node = computeLayout(this, this.render());
      const { layout } = node;
      if (!layout) return;
      return layout;
    }

    // 解析record里的模板字符串，如min、max、50%...
    parseReplaceStr(value, scale) {
      const replaceMap = {
        min: 0,
        max: 1,
        median: 0.5,
      };

      // 传入的是 min、max、median 的
      if (!isNil(replaceMap[value])) {
        return replaceMap[value];
      }

      // 传入的是 xx%
      if (isString(value) && value.indexOf('%') != -1 && !isNaN(Number(value.slice(0, -1)))) {
        const rateValue = Number(value.slice(0, -1));
        const percent = rateValue / 100;
        return percent;
      }

      return scale.scale(value);
    }

    parsePoint(record) {
      const { props } = this;
      const { chart, coord } = props;
      const xScale = chart.getXScales()[0];
      // 只取第一个yScale
      const yScale = chart.getYScales()[0];

      // 解析 record 为归一化后的坐标
      const x = this.parseReplaceStr(record[xScale.field], xScale);
      const y = this.parseReplaceStr(record[yScale.field], yScale);

      return coord.convertPoint({ x, y });
    }

    convertPoints(records) {
      return records.map((record) => this.parsePoint(record));
    }

    getGuideTheme() {
      const { context } = this;
      const { theme } = context;
      return theme.guide;
    }

    render() {
      const { props, context } = this;
      const { coord, records = [], animation, chart, style, onClick, visible = true } = props;
      if(!visible) return;
      const { width, height } = context;
      const points = this.convertPoints(records);
      const theme = this.getGuideTheme();
      const checkNaN = points.some((d)=> isNaN(d.x) || isNaN(d.y))
      if(checkNaN) return;

      return (
        <group
          onClick={(ev) => {
            onClick && onClick(ev);
          }}
        >
          <View
            points={points}
            theme={theme}
            coord={coord}
            {...props}
            canvasWidth={width}
            canvasHeight={height}
            style={isFunction(style) ? style(points, chart) : style}
            animation={isFunction(animation) ? animation(points, chart) : animation}
          />
        </group>
      );
    }
  };
}
