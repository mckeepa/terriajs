'use strict';
import React from 'react';
import defaultValue from 'terriajs-cesium/Source/Core/defaultValue';
import knockout from 'terriajs-cesium/Source/ThirdParty/knockout';
import ObserveModelMixin from '../ObserveModelMixin';
import ParameterEditor from './ParameterEditor';
import when from 'terriajs-cesium/Source/ThirdParty/when';
import TerriaError from '../../Core/TerriaError';

const InvokeFunction = React.createClass({
    mixins: [ObserveModelMixin],

    propTypes: {
        terria: React.PropTypes.object,
        previewed: React.PropTypes.object,
        viewState: React.PropTypes.object
    },

    _parameterValues: {},

    componentWillMount() {
       this.setParams();
       knockout.track(this._parameterValues);
    },


    submit() {
      const that = this;
      console.log(this._parameterValues);
      try {
          const promise = when(this.props.previewed.invoke(this._parameterValues)).otherwise(function(terriaError) {
              if (terriaError instanceof TerriaError) {
                  that.props.previewed.terria.error.raiseEvent(terriaError);
              }
          });
          // Show the Now Viewing panel
          that.props.previewed.terria.nowViewing.showNowViewingRequested.raiseEvent();

          return promise;
      } catch (e) {
          if (e instanceof TerriaError) {
              that.props.previewed.terria.error.raiseEvent(e);
          }
          return undefined;
      }
    },

    setParams() {
        const parameters = this.props.previewed.parameters;
        for (let i = 0; i < parameters.length; ++i) {
            const parameter = parameters[i];
            this._parameterValues[parameter.id] = parameter.defaultValue;
        }
    },

    getParams() {
       return this.props.previewed.parameters.map((param, i)=>
        <ParameterEditor key={i}
                         parameter={param}
                         viewState={this.props.viewState}
                         previewed={this.props.previewed}
                         parameterValues={this._parameterValues}
        />
    );},

    render() {
        return (<div>
                    <div className="invoke-function__content">
                        <div className="invoke-function__description">{this.props.previewed.description}</div>
                        {this.getParams()}
                    </div>
                    <div className="invoke-function__footer">
                        <button className='btn btn-primary' onClick={this.submit}>Run Analysis</button>
                    </div>
                </div>);
    }
});

module.exports = InvokeFunction;