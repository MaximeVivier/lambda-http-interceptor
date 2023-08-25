import { Construct } from "constructs";
import { Aspects, IAspect, Stack } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { CfnFunction, LayerVersion } from "aws-cdk-lib/aws-lambda";

export interface NodejsInternalExtension {
  layerVersion: LayerVersion;
  entryPoint: string;
}

const getPreviousNodeOptions = (node: NodejsFunction): string | undefined => {
  const env = Stack.of(node).resolve(
    (node.node.defaultChild as CfnFunction).environment,
  ) as { variables?: Record<string, string> } | undefined;
  if (env === undefined) {
    return undefined;
  }
  return env.variables?.NODE_OPTIONS;
};

export const applyNodejsInternalExtensionToNodeJsFunction = (
  nodeJsFunction: NodejsFunction,
  internalExtension: NodejsInternalExtension,
): void => {
  const previousNodeOptions = getPreviousNodeOptions(nodeJsFunction);
  const requireExtensionOption = `--require /opt/${internalExtension.entryPoint}`;
  const newNodeOptions = previousNodeOptions
    ? [previousNodeOptions, requireExtensionOption].join(" ")
    : requireExtensionOption;

  nodeJsFunction.addEnvironment("NODE_OPTIONS", newNodeOptions);
  nodeJsFunction.addLayers(internalExtension.layerVersion);
};

class NodejsInternalExtensionApplier implements IAspect {
  constructor(private internalExtension: NodejsInternalExtension) {}
  public visit(node: Construct): void {
    if (node instanceof NodejsFunction) {
      applyNodejsInternalExtensionToNodeJsFunction(
        node,
        this.internalExtension,
      );
    }
  }
}

export const applyNodejsInternalExtension = (
  node: Construct,
  internalExtension: NodejsInternalExtension,
): void => {
  Aspects.of(node).add(new NodejsInternalExtensionApplier(internalExtension));
};
