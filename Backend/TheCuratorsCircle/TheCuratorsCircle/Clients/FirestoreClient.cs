using Google.Cloud.Firestore;

namespace TheCuratorsCircle.Clients;

public class FirestoreClient
{
    private readonly FirestoreDb _db;

    public FirestoreClient(FirestoreDb db)
    {
        _db = db;
    }

    public FirestoreDb Database => _db;
}
