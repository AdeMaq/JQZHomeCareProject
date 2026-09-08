using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JQZHomeCareProject.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitPatientSnapshots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PatientAddressSnapshot",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PatientDescriptionSnapshot",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PatientNameSnapshot",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PatientPhoneSnapshot",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PatientAddressSnapshot",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "PatientDescriptionSnapshot",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "PatientNameSnapshot",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "PatientPhoneSnapshot",
                table: "Visits");
        }
    }
}
