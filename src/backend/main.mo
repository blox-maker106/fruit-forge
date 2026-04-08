import List "mo:core/List";
import Types "types/ai-generation";
import AiGenerationMixin "mixins/ai-generation-api";

actor {
  let generations = List.empty<Types.Generation>();
  var nextIdValue : Nat = 0;
  let nextId = { var value = nextIdValue };

  include AiGenerationMixin(generations, nextId);
};
