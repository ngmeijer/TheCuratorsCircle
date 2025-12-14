using Google.Cloud.Firestore;
using Google.Type;

namespace TheCuratorsCircle.Models;

[FirestoreData]
public class AccountDocument
{
    [FirestoreDocumentId] public string Id { get; set; }
    
    [FirestoreProperty] public required string FullName { get; set; }
    
    [FirestoreProperty] public required Date DateOfBirth { get; set; }
    
    
}