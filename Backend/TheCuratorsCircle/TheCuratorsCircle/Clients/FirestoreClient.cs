using Google.Cloud.Firestore;

namespace TheCuratorsCircle.Clients;

public class FirestoreClient
{
    private readonly FirestoreDb _db;

    public FirestoreClient()
    {
        _db = FirestoreDb.Create("thecuratorscircle");
    }

    public FirestoreDb Database => _db;
}
