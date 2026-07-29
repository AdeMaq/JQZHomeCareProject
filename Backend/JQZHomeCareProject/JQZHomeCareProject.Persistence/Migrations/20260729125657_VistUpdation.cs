using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JQZHomeCareProject.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class VistUpdation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_PractitionerId",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_Users_PractitionerId",
                table: "Users",
                column: "PractitionerId",
                unique: true,
                filter: "[PractitionerId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_PractitionerId",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_Users_PractitionerId",
                table: "Users",
                column: "PractitionerId");
        }
    }
}
