using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JQZHomeCareProject.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InstallmentsLoga : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmountDue",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "AmountReceived",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "CollectionStatus",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "ReceivedBy",
                table: "Visits");

            migrationBuilder.AddColumn<decimal>(
                name: "AmountCollectedByPractitioner",
                table: "PractitionerSettlements",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "ReceivedBy",
                table: "PatientPackages",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "InstallmentPayments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientPackageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VisitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReceivedBy = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstallmentPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InstallmentPayments_PatientPackages_PatientPackageId",
                        column: x => x.PatientPackageId,
                        principalTable: "PatientPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InstallmentPayments_Visits_VisitId",
                        column: x => x.VisitId,
                        principalTable: "Visits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPayments_PatientPackageId_Date",
                table: "InstallmentPayments",
                columns: new[] { "PatientPackageId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPayments_VisitId",
                table: "InstallmentPayments",
                column: "VisitId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InstallmentPayments");

            migrationBuilder.DropColumn(
                name: "AmountCollectedByPractitioner",
                table: "PractitionerSettlements");

            migrationBuilder.DropColumn(
                name: "ReceivedBy",
                table: "PatientPackages");

            migrationBuilder.AddColumn<decimal>(
                name: "AmountDue",
                table: "Visits",
                type: "decimal(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AmountReceived",
                table: "Visits",
                type: "decimal(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "CollectionStatus",
                table: "Visits",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ReceivedBy",
                table: "Visits",
                type: "int",
                nullable: true);
        }
    }
}
