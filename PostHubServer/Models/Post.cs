using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PostHubServer.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public virtual Hub? Hub { get; set; }

        [InverseProperty("MainCommentOf")]
        [JsonIgnore]
        public virtual Comment? MainComment { get; set; } // Commentaire principal de l'auteur qui a créé le post
        public int MainCommentId { get; set; } // Id du commentaire principal de l'auteur qui a créé le post
    }
}
