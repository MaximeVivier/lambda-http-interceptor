import { Construct } from "constructs";
import { Aspects, IAspect } from "aws-cdk-lib";
import { applyNodejsInternalExtensionToNodeJsFunction } from "./applyNodejsInternalExtension";
import { HttpInterceptor } from "./HttpInterceptor";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { HTTP_INTERCEPTOR_TABLE_NAME } from "./sdk";

class HttpInterceptorApplier implements IAspect {
  constructor(private httpInterceptor: HttpInterceptor) {}
  public visit(node: Construct): void {
    if (node instanceof NodejsFunction) {
      applyNodejsInternalExtensionToNodeJsFunction(
        node,
        this.httpInterceptor.extension,
      );
      node.addEnvironment(
        HTTP_INTERCEPTOR_TABLE_NAME,
        this.httpInterceptor.table.tableName,
      );
      this.httpInterceptor.table.grantReadData(node);
    }
  }
}
export const applyHttpInterceptor = (
  node: Construct,
  httpInterceptor: HttpInterceptor,
): void => {
  Aspects.of(node).add(new HttpInterceptorApplier(httpInterceptor));
};
