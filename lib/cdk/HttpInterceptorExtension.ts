import { NodejsInternalExtension } from './applyNodejsInternalExtension';
import {
  Architecture,
  Code,
  LayerVersion,
  Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class HttpInterceptorExtension
  extends Construct
  implements NodejsInternalExtension
{
  public readonly layerVersion: LayerVersion;
  public readonly entryPoint: string;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.layerVersion = new LayerVersion(scope, 'HttpInterceptorLayer', {
      compatibleRuntimes: [Runtime.NODEJS_18_X],
      compatibleArchitectures: [Architecture.ARM_64],
      code: Code.fromAsset(`${__dirname}/../layer`),
    });
    this.entryPoint = 'interceptor.js';
  }
}
