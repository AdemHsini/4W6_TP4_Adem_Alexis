using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PostHubServer.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Text { get; set; } = null!;
        public DateTime? Date { get; set; }

        [InverseProperty("ParentComment")]
        public virtual List<Comment>? SubComments { get; set; }

        // Si ceci est un sous-commentaire, référence vers le commentaire parent. (Seuls les commentaires
        // principaux d'un post n'ont pas de commentaire parent)
        [InverseProperty("SubComments")]
        [JsonIgnore]
        public virtual Comment? ParentComment { get; set; }

        // Si ce commentaire est le commentaire principal du post, référence vers le post en question
        [InverseProperty("MainComment")]
        public virtual Post? MainCommentOf { get; set; }

        [InverseProperty("Comments")]
        [JsonIgnore]
        public virtual User? User { get; set; }

        [InverseProperty("Upvotes")]
        [JsonIgnore]
        public virtual List<User>? Upvoters { get; set; } = new List<User>();

        [InverseProperty("Downvotes")]
        [JsonIgnore]
        public virtual List<User>? Downvoters { get; set; } = new List<User>();

        public virtual bool Reported { get; set; } = false;

        public virtual List<Picture>? Pictures { get; set; } = new List<Picture>();

        public int GetSubCommentTotal()
        {
            SubComments ??= new List<Comment>();
            int total = SubComments.Where(c => c.User != null).Count();
            foreach (Comment c in SubComments)
            {
                total += c.GetSubCommentTotal();
            }
            return total;
        }
    }
}
