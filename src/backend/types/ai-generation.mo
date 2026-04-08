module {
  public type GenerationId = Nat;

  public type GenerationRequest = {
    drawingBase64 : Text;
    prompt : Text;
  };

  public type GenerationStatus = {
    #pending;
    #success;
    #failed : Text;
  };

  public type Generation = {
    id : GenerationId;
    prompt : Text;
    imageUrl : Text;
    status : GenerationStatus;
    createdAt : Int;
  };

  public type GenerationResult = {
    #ok : Generation;
    #err : Text;
  };
};
