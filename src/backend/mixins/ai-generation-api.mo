import Types "../types/ai-generation";
import AiGenerationLib "../lib/ai-generation";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import OutCall "mo:caffeineai-http-outcalls/outcall";

mixin (
  generations : List.List<Types.Generation>,
  nextId : { var value : Nat },
) {
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    Runtime.trap("not implemented");
  };

  public shared func generateDesign(request : Types.GenerationRequest) : async Types.GenerationResult {
    Runtime.trap("not implemented");
  };

  public query func getRecentGenerations() : async [Types.Generation] {
    Runtime.trap("not implemented");
  };
};
