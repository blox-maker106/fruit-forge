import Types "../types/ai-generation";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

module {
  let MAX_STORED : Nat = 10;

  public func buildPromptUrl(prompt : Text) : Text {
    Runtime.trap("not implemented");
  };

  public func addGeneration(
    generations : List.List<Types.Generation>,
    nextId : Nat,
    generation : Types.Generation,
  ) : Nat {
    Runtime.trap("not implemented");
  };

  public func pruneGenerations(generations : List.List<Types.Generation>) : () {
    Runtime.trap("not implemented");
  };

  public func getGenerations(generations : List.List<Types.Generation>) : [Types.Generation] {
    Runtime.trap("not implemented");
  };
};
