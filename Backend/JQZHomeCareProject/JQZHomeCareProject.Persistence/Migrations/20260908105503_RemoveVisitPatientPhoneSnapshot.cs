using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JQZHomeCareProject.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveVisitPatientPhoneSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PatientPhoneSnapshot",
                table: "Visits");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PatientPhoneSnapshot",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
