using System.ComponentModel.DataAnnotations;

namespace PostHubServer.Models.DTOs
{
    public class ChangePasswordDTO
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string oldPassword { get; set; }
        [Required]
        public string NewPassword { get; set; }
    }
}
